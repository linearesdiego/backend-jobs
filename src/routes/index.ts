import { Router } from "express";
import authRoutes from "../modules/auth/auth.routes";
import chatRoutes from "../modules/chat/chat.routes";

const router = Router();

router.use("/auth", authRoutes);
router.use("/chat", chatRoutes);

export default router;
