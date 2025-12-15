import {
  IsEmail,
  IsNotEmpty,
  IsString,
  MinLength,
  IsEnum,
  Matches,
} from "class-validator";

export class RegisterDTO {
  @IsNotEmpty({ message: "El email es requerido" })
  @IsEmail({}, { message: "Debe ser un email válido" })
  email: string;

  @IsNotEmpty({ message: "La contraseña es requerida" })
  @IsString()
  @MinLength(6, { message: "La contraseña debe tener al menos 6 caracteres" })
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, {
    message:
      "La contraseña debe contener al menos una mayúscula, una minúscula y un número",
  })
  password: string;

  @IsNotEmpty({ message: "El rol es requerido" })
  @IsEnum(["CONTRATADOR", "ADMIN", "PROVEEDOR"], {
    message: "El rol debe ser CONTRATADOR, ADMIN o PROVEEDOR",
  })
  role: "CONTRATADOR" | "ADMIN" | "PROVEEDOR";
}

export class LoginDTO {
  @IsNotEmpty({ message: "El email es requerido" })
  @IsEmail({}, { message: "Debe ser un email válido" })
  email: string;

  @IsNotEmpty({ message: "La contraseña es requerida" })
  @IsString()
  @MinLength(6, { message: "La contraseña debe tener al menos 6 caracteres" })
  password: string;
}

export class ChangePasswordDTO {
  @IsNotEmpty({ message: "La contraseña actual es requerida" })
  @IsString()
  currentPassword: string;

  @IsNotEmpty({ message: "La nueva contraseña es requerida" })
  @IsString()
  @MinLength(6, { message: "La contraseña debe tener al menos 6 caracteres" })
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, {
    message:
      "La contraseña debe contener al menos una mayúscula, una minúscula y un número",
  })
  newPassword: string;
}

export class RefreshTokenDTO {
  @IsNotEmpty({ message: "El refresh token es requerido" })
  @IsString()
  refreshToken: string;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  data?: {
    user: {
      id: string;
      email: string;
      role: string;
    };
    token: string;
  };
  error?: string;
}

export interface JWTPayload {
  userId: string;
  email: string;
  role: string;
}
