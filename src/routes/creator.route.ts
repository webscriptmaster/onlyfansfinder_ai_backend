import express from "express";

import creatorController from "../controllers/creator.controller";
import authMiddleware from "../middleware/auth.middleware.ts";

const router = express.Router();

router.post("/search", authMiddleware, creatorController.search);

router.post(
  "/batch-create-by-scrapping",
  creatorController.batchCreateByScrapping
);

export default router;
