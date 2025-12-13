export interface RegisterDTO {
  email: string;
  password: string;
  role: "CONTRATADOR" | "ADMIN" | "PROVEEDOR";
}

export interface LoginDTO {
  email: string;
  password: string;
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
