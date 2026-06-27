import express from "express";
import { generateFlashcards } from "../controllers/flashcardController.js";
import {protect} from "../middlewares/authMiddleware.js";

const router = express.Router();

router.post('/:id', protect, generateFlashcards);

export default router;