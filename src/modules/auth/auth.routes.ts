import { Router } from "express";
import rateLimit from "express-rate-limit";
import { AuthController } from "./auth.controller";
import { authMiddleware } from "../../middlewares/auth.middleware";
import { validate } from "../../middlewares/validate.middleware";
import {
  LoginDTO,
  RegisterDTO,
  ChangePasswordDTO,
  RefreshTokenDTO,
  ForgotPasswordDTO,
  ResetPasswordDTO,
} from "./auth.model";

const router = Router();
const authController = new AuthController();

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: {
    success: false,
    message: "Too many login attempts. Please try again in 15 minutes.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

const forgotPasswordLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 3,
  message: {
    success: false,
    message: "Too many password reset requests. Please try again in 1 hour.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Rutas públicas
router.post("/register", validate(RegisterDTO), authController.register);
router.post("/login", loginLimiter, validate(LoginDTO), authController.login);
router.post(
  "/refresh-token",
  validate(RefreshTokenDTO),
  authController.refreshToken,
);
router.post("/verify-email", authController.verifyEmail);
router.post("/resend-verification", authController.resendVerification);
router.post("/forgot-password", forgotPasswordLimiter, validate(ForgotPasswordDTO), authController.forgotPassword);
router.post("/reset-password", validate(ResetPasswordDTO), authController.resetPassword);

// Rutas protegidas
router.get("/me", authMiddleware, authController.me);
router.post(
  "/change-password",
  authMiddleware,
  validate(ChangePasswordDTO),
  authController.changePassword,
);

export default router;
