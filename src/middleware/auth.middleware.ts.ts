import { Request, Response, NextFunction } from "express";
import httpStatus from "http-status";
import { verify } from "jsonwebtoken";

import { AUTHORIZATION_PREFIX, USER_STATUS } from "../utils/const.util";
import defaultConfig from "../config/default.config";
import { IUser } from "../models/user.model";

export default async function authMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
) {
  if (
    req.headers &&
    req.headers.authorization &&
    req.headers.authorization.split(" ")[0] === AUTHORIZATION_PREFIX
  ) {
    const decodedUser = verify(
      req.headers.authorization.split(" ")[1],
      defaultConfig.jwt.access.secret
    ) as IUser;

    if (decodedUser && decodedUser.status === USER_STATUS.ACTIVE) {
      req.user = decodedUser;
      next();
    } else {
      req.user = undefined;
      res
        .status(httpStatus.UNAUTHORIZED)
        .json({ message: "Unauthorized user!" });
    }
  } else {
    req.user = undefined;
    res.status(httpStatus.UNAUTHORIZED).json({ message: "Unauthorized user!" });
  }
}
