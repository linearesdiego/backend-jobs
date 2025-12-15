import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import prisma from "../../config/prisma";
import { CustomError } from "../../utils/customError";
import { RegisterDTO, JWTPayload } from "./auth.model";

export class AuthService {
  private readonly JWT_SECRET: string;
  private readonly JWT_EXPIRES_IN: string;
  private readonly SALT_ROUNDS = 10;

  constructor() {
    this.JWT_SECRET = process.env.JWT_SECRET!;
    this.JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN!;
  }

  async register(data: RegisterDTO) {
    // Verificar si el usuario ya existe
    const existingUser = await prisma.user.findUnique({
      where: { email: data.email },
    });

    if (existingUser) throw new CustomError("El email ya está registrado", 409);

    // Hash de la contraseña
    const hashedPassword = await bcrypt.hash(data.password, this.SALT_ROUNDS);

    // Crear el usuario y perfil en una transacción
    const newUser = await prisma.$transaction(async (tx) => {
      // Crear el usuario
      const user = await tx.user.create({
        data: {
          email: data.email,
          password: hashedPassword,
          role: data.role,
        },
      });

      // Crear perfil según el rol
      if (data.role === "CONTRATADOR") {
        await tx.contractorProfile.create({
          data: {
            userId: user.id,
          },
        });
      } else if (data.role === "PROVEEDOR") {
        await tx.providerProfile.create({
          data: {
            userId: user.id,
            name: "",
            perfilCompleto: false,
          },
        });
      }

      return user;
    });

    // Generar token
    const token = this.generateToken({
      userId: newUser.id,
      email: newUser.email,
      role: newUser.role,
    });

    const refreshToken = this.generateRefreshToken({
      userId: newUser.id,
      email: newUser.email,
      role: newUser.role,
    });

    return {
      user: {
        id: newUser.id,
        email: newUser.email,
        role: newUser.role,
      },
      token,
      refreshToken,
    };
  }

  async login(email: string, password: string) {
    // Buscar el usuario
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) throw new CustomError("Credenciales inválidas", 401);

    // Verificar la contraseña
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      throw new CustomError("Credenciales inválidas", 401);
    }

    // Generar token
    const token = this.generateToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    const refreshToken = this.generateRefreshToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    return {
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
      },
      token,
      refreshToken,
    };
  }

  generateToken(payload: JWTPayload): string {
    return jwt.sign(payload, this.JWT_SECRET, {
      expiresIn: this.JWT_EXPIRES_IN,
    } as jwt.SignOptions);
  }

  verifyToken(token: string): JWTPayload {
    try {
      return jwt.verify(token, this.JWT_SECRET) as JWTPayload;
    } catch (error) {
      throw new CustomError("Token inválido o expirado", 401);
    }
  }

  async getUserById(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) throw new CustomError("Usuario no encontrado", 404);

    return user;
  }

  async changePassword(
    userId: string,
    currentPassword: string,
    newPassword: string
  ) {
    // Buscar el usuario
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) throw new CustomError("Usuario no encontrado", 404);

    // Verificar la contraseña actual
    const isPasswordValid = await bcrypt.compare(
      currentPassword,
      user.password
    );

    if (!isPasswordValid) {
      throw new CustomError("La contraseña actual es incorrecta", 401);
    }

    // Hash de la nueva contraseña
    const hashedPassword = await bcrypt.hash(newPassword, this.SALT_ROUNDS);

    // Actualizar la contraseña
    await prisma.user.update({
      where: { id: userId },
      data: { password: hashedPassword },
    });

    return { message: "Contraseña actualizada exitosamente" };
  }

  generateRefreshToken(payload: JWTPayload): string {
    return jwt.sign(payload, this.JWT_SECRET, {
      expiresIn: "7d", // Refresh token válido por 7 días
    } as jwt.SignOptions);
  }

  async refreshToken(refreshToken: string) {
    try {
      const payload = jwt.verify(refreshToken, this.JWT_SECRET) as JWTPayload;

      // Verificar que el usuario aún existe
      const user = await prisma.user.findUnique({
        where: { id: payload.userId },
      });

      if (!user) throw new CustomError("Usuario no encontrado", 404);

      // Generar nuevos tokens
      const newAccessToken = this.generateToken({
        userId: user.id,
        email: user.email,
        role: user.role,
      });

      const newRefreshToken = this.generateRefreshToken({
        userId: user.id,
        email: user.email,
        role: user.role,
      });

      return {
        accessToken: newAccessToken,
        refreshToken: newRefreshToken,
      };
    } catch (error) {
      throw new CustomError("Refresh token inválido o expirado", 401);
    }
  }
}
