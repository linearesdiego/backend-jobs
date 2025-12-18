import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import prisma from "../../config/prisma";
import { CustomError } from "../../utils/customError";
import { RegisterDTO, JWTPayload } from "./auth.model";
import { env } from "../../config/env";

export class AuthService {
  private readonly JWT_SECRET: string;
  private readonly JWT_EXPIRES_IN: string;
  private readonly SALT_ROUNDS = 10;

  constructor() {
    if (!env.JWT_SECRET) {
      throw new Error("JWT_SECRET no está configurado");
    }
    if (!env.JWT_EXPIRES_IN) {
      throw new Error("JWT_EXPIRES_IN no está configurado");
    }
    this.JWT_SECRET = env.JWT_SECRET;
    this.JWT_EXPIRES_IN = env.JWT_EXPIRES_IN;
  }

  async register(data: RegisterDTO) {
    // Verificar si el usuario ya existe
    const existingUser = await prisma.usuario.findUnique({
      where: { email: data.email },
    });

    if (existingUser) throw new CustomError("El email ya está registrado", 409);

    // Hash de la contraseña
    const hashedPassword = await bcrypt.hash(data.password, this.SALT_ROUNDS);

    // Crear el usuario y perfil en una transacción
    const newUser = await prisma.$transaction(async (tx) => {
      // Crear el usuario
      const user = await tx.usuario.create({
        data: {
          email: data.email,
          clave: hashedPassword,
          rol: data.role,
        },
      });

      // Crear perfil según el rol
      if (data.role === "CONTRATADOR") {
        await tx.perfilContratador.create({
          data: {
            usuarioId: user.id,
          },
        });
      } else if (data.role === "PROVEEDOR") {
        await tx.perfilProveedor.create({
          data: {
            usuarioId: user.id,
            nombreCompleto: "",
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
      role: newUser.rol,
    });

    const refreshToken = this.generateRefreshToken({
      userId: newUser.id,
      email: newUser.email,
      role: newUser.rol,
    });

    return {
      user: {
        id: newUser.id,
        email: newUser.email,
        rol: newUser.rol,
      },
      token,
      refreshToken,
    };
  }

  async login(email: string, password: string) {
    // Buscar el usuario
    const user = await prisma.usuario.findUnique({
      where: { email },
    });

    if (!user) throw new CustomError("Credenciales inválidas", 401);

    // Verificar la contraseña
    const isPasswordValid = await bcrypt.compare(password, user.clave);

    if (!isPasswordValid) {
      throw new CustomError("Credenciales inválidas", 401);
    }

    // Generar token
    const token = this.generateToken({
      userId: user.id,
      email: user.email,
      role: user.rol,
    });

    const refreshToken = this.generateRefreshToken({
      userId: user.id,
      email: user.email,
      role: user.rol,
    });

    return {
      user: {
        id: user.id,
        email: user.email,
        rol: user.rol,
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
    const user = await prisma.usuario.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        rol: true,
        creadoEn: true,
        actualizadoEn: true,
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
    const user = await prisma.usuario.findUnique({
      where: { id: userId },
    });

    if (!user) throw new CustomError("Usuario no encontrado", 404);

    // Verificar la contraseña actual
    const isPasswordValid = await bcrypt.compare(currentPassword, user.clave);

    if (!isPasswordValid) {
      throw new CustomError("La contraseña actual es incorrecta", 401);
    }

    // Hash de la nueva contraseña
    const hashedPassword = await bcrypt.hash(newPassword, this.SALT_ROUNDS);

    // Actualizar la contraseña
    await prisma.usuario.update({
      where: { id: userId },
      data: { clave: hashedPassword },
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
      const user = await prisma.usuario.findUnique({
        where: { id: payload.userId },
      });

      if (!user) throw new CustomError("Usuario no encontrado", 404);

      // Generar nuevos tokens
      const newAccessToken = this.generateToken({
        userId: user.id,
        email: user.email,
        role: user.rol,
      });

      const newRefreshToken = this.generateRefreshToken({
        userId: user.id,
        email: user.email,
        role: user.rol,
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
