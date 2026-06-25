import express from 'express';
import { chatWithPDF } from "../controllers/chatController";
import { protect } from "../middlewares/authMiddleware";

const router = express.Router();

router.post('/', protect, chatWithPDF);

export default router;