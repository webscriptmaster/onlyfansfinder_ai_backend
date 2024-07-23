import { Request, Response, NextFunction } from "express";
import httpStatus from "http-status";

import { User } from "../models/user.model";
import { Favorite } from "../models/favorite.model";

/**
 * Get
 *
 * @param req
 * @param res
 * @param _next
 */
async function get(req: Request, res: Response, next: NextFunction) {
  try {
    if (!req.user) {
      return;
    }

    const { _id: userId } = req.user;

    const favorite = await Favorite.findOne({ userId });
    const result = await User.find({ _id: { $in: favorite?.creatorId } });

    res.status(httpStatus.OK).json({ success: true, result });
  } catch (error) {
    console.error("favorite.controller get error: ", error);
  } finally {
    next();
  }
}

/**
 * Like creator
 *
 * @param req
 * @param res
 * @param next
 * @returns
 */
async function like(req: Request, res: Response, next: NextFunction) {
  try {
    if (!req.user) {
      return;
    }

    const { creatorId } = req.body;
    const { _id: userId } = req.user;

    const update = { $addToSet: { creatorId } };

    await Favorite.findOneAndUpdate({ userId }, update, {
      new: true,
      upsert: true
    });

    res
      .status(httpStatus.OK)
      .json({ success: true, msg: "You liked a creator" });
  } catch (error) {
    console.error("favorite.controller like error: ", error);
  } finally {
    next();
  }
}

/**
 * Dislike creator
 *
 * @param req
 * @param res
 * @param next
 * @returns
 */
async function dislike(req: Request, res: Response, next: NextFunction) {
  try {
    if (!req.user) {
      return;
    }

    const { creatorId } = req.body;
    const { _id: userId } = req.user;

    const update = { $pull: { creatorId } };

    await Favorite.findOneAndUpdate({ userId }, update, {
      new: true,
      upsert: true
    });

    res
      .status(httpStatus.OK)
      .json({ success: true, msg: "You disliked a creator" });
  } catch (error) {
    console.error("favorite.controller dislike error: ", error);
  } finally {
    next();
  }
}

export default {
  get,
  like,
  dislike
};
