import { Router } from "express";
import { adminController } from "./admin.controller";
import { authMiddleware, roleMiddleware } from "../../middlewares/auth.middleware";
import { uploadAdMedia } from "../../middlewares/upload.middleware";

const router = Router();

// Public — no auth required
router.get("/ads/active", adminController.getActiveAds.bind(adminController));

// All routes below require authentication
router.use(authMiddleware);

// ADMIN + MOD access
router.use(roleMiddleware("ADMIN", "MOD"));
router.get("/users", adminController.listUsers.bind(adminController));
router.patch("/users/:id/ban", adminController.banUser.bind(adminController));
router.patch("/users/:id/unban", adminController.unbanUser.bind(adminController));

// ADMIN only
router.use(roleMiddleware("ADMIN"));
router.post("/mods", adminController.createMod.bind(adminController));
router.post("/ads", uploadAdMedia.single("media"), adminController.uploadAd.bind(adminController));
router.get("/ads", adminController.listAds.bind(adminController));
router.patch("/ads/:id", adminController.updateAd.bind(adminController));
router.delete("/ads/:id", adminController.deleteAd.bind(adminController));
router.get("/logs", adminController.getLogs.bind(adminController));

export default router;
