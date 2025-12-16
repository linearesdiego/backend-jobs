import { Router } from "express";
import authRoutes from "../modules/auth/auth.routes";
import chatRoutes from "../modules/chat/chat.routes";
import postulacionRoutes from "../modules/postulaciones/postulacion.routes";
import profileRoutes from "../modules/profile/profile.routes";

const router = Router();

router.use("/auth", authRoutes);
router.use("/chat", chatRoutes);
router.use("/postulaciones", postulacionRoutes);
router.use("/profile", profileRoutes);

export default router;
