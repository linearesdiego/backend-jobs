import { Router } from "express";
import { moderationController } from "./moderation.controller";
import {
  authMiddleware,
  roleMiddleware,
} from "../../middlewares/auth.middleware";

const router = Router();

router.use(authMiddleware);
router.use(roleMiddleware("ADMIN", "MOD"));

router.get(
  "/submissions",
  moderationController.listSubmissions.bind(moderationController),
);
router.patch(
  "/submissions/:providerId/approve",
  moderationController.approve.bind(moderationController),
);
router.patch(
  "/submissions/:providerId/reject",
  moderationController.reject.bind(moderationController),
);

export default router;
