import { Router } from "express";
import authRoutes from "../modules/auth/auth.routes";
import chatRoutes from "../modules/chat/chat.routes";
import profileRoutes from "../modules/profile/profile.routes";
import ratingRoutes from "../modules/rating/rating.routes";
import notificationRoutes from "../modules/notifications/notification.routes";
import adminRoutes from "../modules/admin/admin.routes";

const router = Router();

router.use("/auth", authRoutes);
router.use("/chat", chatRoutes);
router.use("/profile", profileRoutes);
router.use("/ratings", ratingRoutes);
router.use("/notifications", notificationRoutes);
router.use("/admin", adminRoutes);

export default router;
