import { genSaltSync, hashSync } from "bcryptjs";
import { Request, Response, NextFunction } from "express";
import httpStatus from "http-status";
import { verify } from "jsonwebtoken";
import { customAlphabet, nanoid } from "nanoid";

import { IUser, User } from "../models/user.model";
import { RegisterToken } from "../models/register-token.model";
import {
  APP_ENV,
  SITE_TITLE,
  USER_ROLES,
  USER_STATUS
} from "../utils/const.util";
import defaultConfig from "../config/default.config";
import { sendEmail } from "../services/email.service";
import { RefreshToken } from "../models/refresh-token.model";
import upload from "../services/upload.service";

/**
 * Login
 *
 * @param req
 * @param res
 * @param _next
 */
async function login(req: Request, res: Response, next: NextFunction) {
  const { email, password } = req.body;

  try {
    const user: IUser = await User.findOne({ email }).select("+password");

    if (
      user &&
      user.status === USER_STATUS.ACTIVE &&
      user.comparePassword(password)
    ) {
      await RefreshToken.deleteMany({
        userId: user._id
      });

      const expiry = new Date();
      expiry.setHours(
        expiry.getHours() + defaultConfig.jwt.refresh.expiry_hour
      );
      const refreshToken = new RefreshToken({
        userId: user._id,
        token: user.generateRefreshToken(),
        expiry
      });
      await refreshToken.save();

      res.status(httpStatus.OK).json({
        user,
        accessToken: user.generateAccessToken(),
        refreshToken: refreshToken.token,
        msg: "You logged in successfully."
      });
    } else {
      res
        .status(httpStatus.UNAUTHORIZED)
        .json({ success: false, msg: "Authentication failed." });
    }
  } catch (error) {
    console.error("auth.controller login error: ", error);
  } finally {
    next();
  }
}

/**
 * logout
 *
 * @param req
 * @param res
 * @param next
 */
async function logout(req: Request, res: Response, next: NextFunction) {
  try {
    await RefreshToken.deleteMany({
      userId: req.user?._id
    });

    res.status(httpStatus.OK).json({
      success: true
    });
  } catch (error) {
    console.error("auth.controller logout error: ", error);
  } finally {
    next();
  }
}

/**
 * Register a user
 *
 * @param req
 * @param res
 * @param _next
 */
async function register(req: Request, res: Response, next: NextFunction) {
  const {
    role,
    name,
    email,
    phone,
    age,
    address,
    qa,
    characteristics,
    subscriptionId,
    password
  } = req.body;

  try {
    const existingEmail = await User.findOne({ email });

    if (existingEmail) {
      if (existingEmail.status === USER_STATUS.PENDING) {
        await RegisterToken.deleteMany({ userId: existingEmail._id });
        await User.deleteOne({ email, status: USER_STATUS.PENDING });
      } else {
        res.status(httpStatus.CONFLICT).json({
          success: false,
          msg: "Email is already in use."
        });
        return;
      }
    }

    const user = new User({
      role,
      name,
      email,
      phone,
      age,
      address,
      qa,
      characteristics,
      subscriptionId,
      password,
      // TODO : User verification
      // status: USER_STATUS.PENDING
      status: USER_STATUS.ACTIVE
    });

    await user.save();

    const token = nanoid();
    const code = customAlphabet("0123456789", 4)();
    const expiry = new Date();
    expiry.setHours(expiry.getHours() + defaultConfig.signup.expiry_hour);

    const registerToken = new RegisterToken({
      token,
      userId: user._id,
      code,
      expiry,
      accepted: false
    });

    await registerToken.save();

    if (defaultConfig.app.env === APP_ENV.PRODUCTION) {
      await sendEmail({
        to: email,
        subject: `Welcome to ${SITE_TITLE}`,
        text: `Hi. Welcome to ${SITE_TITLE}. To complete your sign-up, please click following link. ${defaultConfig.app.frontend}/verify/${token}`,
        html: `Hi. Welcome to ${SITE_TITLE}. To complete your sign-up, please click following link. ${defaultConfig.app.frontend}/verify/${token}`
      });
    }

    res.status(httpStatus.OK).json({
      success: true,
      msg: "You have been successfully registered."
    });
  } catch (error) {
    console.error("auth.controller register error: ", error);
  } finally {
    next();
  }
}

/**
 * refresh token
 *
 * @param req
 * @param res
 * @param _next
 * @returns
 */
async function regenerateToken(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const { refreshToken } = req.body;

  try {
    const token = await RefreshToken.findOne({ token: refreshToken });

    if (!token) {
      res.status(httpStatus.NOT_ACCEPTABLE).json({
        success: false,
        msg: "Refresh token not found."
      });
      return;
    }

    if (token && token.expiry < new Date()) {
      res.status(httpStatus.NOT_ACCEPTABLE).json({
        success: false,
        msg: "Refresh token is expired."
      });
      return;
    }

    let decodedUser = verify(refreshToken, defaultConfig.jwt.refresh.secret);
    decodedUser = decodedUser as IUser;

    if (decodedUser._id !== token.userId) {
      res.status(httpStatus.NOT_ACCEPTABLE).json({
        success: false,
        msg: "Refresh token is invalid."
      });
      return;
    }

    const user: IUser | null = await User.findOne({ userId: decodedUser._id });
    if (!user) {
      res.status(httpStatus.NOT_ACCEPTABLE).json({
        success: false,
        msg: "User doesn't exist."
      });
      return;
    }

    await RefreshToken.deleteMany({ userId: decodedUser._id });

    const expiry = new Date();
    expiry.setHours(expiry.getHours() + defaultConfig.jwt.refresh.expiry_hour);
    const newRefreshToken = new RefreshToken({
      userId: decodedUser._id,
      token: user.generateRefreshToken(),
      expiry
    });
    await newRefreshToken.save();

    res.status(httpStatus.OK).json({
      success: true,
      accessToken: user.generateAccessToken(),
      refreshToken: newRefreshToken.token
    });
  } catch (error) {
    console.error("auth.controller regenerateToken error: ", error);
  } finally {
    next();
  }
}

/**
 * Update personal information
 *
 * @param req
 * @param res
 * @param _next
 */
async function updatePersonal(req: Request, res: Response, next: NextFunction) {
  try {
    if (!req.user) {
      return;
    }

    const { _id: userId } = req.user;
    const { name, email, phone, age, address } = req.body;

    const existingEmail = await User.findOne({ email, _id: { $ne: userId } });

    if (existingEmail) {
      res.status(httpStatus.CONFLICT).json({
        success: false,
        msg: "Email is already in use."
      });
      return;
    }

    const user = await User.findByIdAndUpdate(
      userId,
      { name, email, phone, age, address },
      { new: true }
    );

    res.status(httpStatus.OK).json({
      success: true,
      user,
      msg: "Personal information successfully modified."
    });
  } catch (error) {
    console.error("auth.controller updatePersonal error: ", error);
  } finally {
    next();
  }
}

/**
 * Update fan information
 *
 * @param req
 * @param res
 * @param _next
 */
async function updateFan(req: Request, res: Response, next: NextFunction) {
  upload("creator").any()(req, res, async (err) => {
    if (err) {
      res.status(httpStatus.NOT_ACCEPTABLE).json({
        success: false,
        msg: "Something went wrong while uploading images",
        code: err.code
      });
      return;
    }

    try {
      if (!req.user) {
        return;
      }

      const { _id: userId, role } = req.user;

      if (role === USER_ROLES.CUSTOMER) {
        const { qa } = req.body;

        const user = await User.findByIdAndUpdate(
          userId,
          { qa },
          { new: true }
        );

        res.status(httpStatus.OK).json({
          success: true,
          user,
          msg: "Fan information successfully modified."
        });
      } else if (role === USER_ROLES.CREATOR) {
        const update: Record<string, any> = {};

        const { characteristics } = req.body;
        update.characteristics = characteristics;

        if (Array.isArray(req.files) && req.files.length > 0) {
          update.isStatic = true;
          update.avatar = req.files[0].path.replace(/\\/g, "/");
        }

        const user = await User.findByIdAndUpdate(userId, update, {
          new: true
        });

        res.status(httpStatus.OK).json({
          success: true,
          user,
          msg: "Fan information successfully modified."
        });
      }
    } catch (error) {
      console.error("auth.controller updateFan error: ", error);
    } finally {
      next();
    }
  });
}

/**
 * Change password
 *
 * @param req
 * @param res
 * @param _next
 */
async function changePassword(req: Request, res: Response, next: NextFunction) {
  try {
    if (!req.user) {
      return;
    }

    const { _id: userId } = req.user;
    const { current, password } = req.body;

    const user: IUser | null = await User.findById(userId);

    if (!user) return;

    if (!user.comparePassword(current)) {
      res
        .status(httpStatus.NOT_ACCEPTABLE)
        .json({ success: false, msg: "Current password isn't correct" });
      return;
    }

    const salt = genSaltSync(defaultConfig.bcrypt.salt);
    const hashedPassword = hashSync(password, salt);

    await User.findByIdAndUpdate(
      userId,
      { password: hashedPassword },
      { new: true }
    );

    res.status(httpStatus.OK).json({
      success: true,
      msg: "Password successfully changed."
    });
  } catch (error) {
    console.error("auth.controller changePassword error: ", error);
  } finally {
    next();
  }
}

export default {
  login,
  logout,
  register,
  regenerateToken,
  updatePersonal,
  updateFan,
  changePassword
};
