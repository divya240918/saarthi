import express from "express";
import { uploadDocument } from "../controllers/uploadController.js";
import upload from "../middlewares/uploadMiddleware.js";
import protect from "../middlewares/authMiddleware.js";

const router = express.Router();

router.post("/upload", protect, upload.single("pdf"), uploadDocument );

export default router;