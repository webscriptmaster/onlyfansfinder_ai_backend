import express from "express";

import favoriteController from "../controllers/favorite.controller";
import authMiddleware from "../middleware/auth.middleware.ts";

const router = express.Router();

router.get("/get", authMiddleware, favoriteController.get);
router.post("/like", authMiddleware, favoriteController.like);
router.post("/dislike", authMiddleware, favoriteController.dislike);

export default router;
