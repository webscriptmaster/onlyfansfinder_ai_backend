import express, { NextFunction, Request, Response } from "express";

import authRoutes from "./auth.route";
import creatorRoutes from "./creator.route";
import favoriteRoutes from "./favorite.route";

import { SITE_TITLE } from "../utils/const.util";

const router = express.Router();

router.get("/", (_req: Request, res: Response, _next: NextFunction) => {
  res.send(`😀 Welcome to the ${SITE_TITLE} API server!`);
});

router.use("/api/auth", authRoutes);
router.use("/api/creator", creatorRoutes);
router.use("/api/favorite", favoriteRoutes);

export default router;
