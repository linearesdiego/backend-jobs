import { Router } from "express";
import { AuthController } from "./auth.controller";
import { authMiddleware } from "../../middlewares/auth.middleware";
import { validate } from "../../middlewares/validate.middleware";
import {
  LoginDTO,
  RegisterDTO,
  ChangePasswordDTO,
  RefreshTokenDTO,
} from "./auth.model";

const router = Router();
const authController = new AuthController();

// Rutas públicas
router.post("/register", validate(RegisterDTO), authController.register);
router.post("/login", validate(LoginDTO), authController.login);
router.post(
  "/refresh-token",
  validate(RefreshTokenDTO),
  authController.refreshToken,
);
router.post("/verify-email", authController.verifyEmail);
router.post("/resend-verification", authController.resendVerification);

// Rutas protegidas
router.get("/me", authMiddleware, authController.me);
router.post(
  "/change-password",
  authMiddleware,
  validate(ChangePasswordDTO),
  authController.changePassword,
);

export default router;
