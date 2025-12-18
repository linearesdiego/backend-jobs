import {
  IsNotEmpty,
  IsString,
  IsOptional,
  IsUrl,
  MaxLength,
  Matches,
  ValidateIf,
  IsUUID,
} from "class-validator";

/**
 * DTO para validar el ID de postulación en los parámetros de ruta
 */
export class PostulacionIdParamDTO {
  @IsNotEmpty({ message: "El ID de postulación es requerido" })
  @IsUUID(4, { message: "El ID de postulación debe ser un UUID válido" })
  postulacionId: string;
}

/**
 * DTO para validar el ID de chat en los parámetros de ruta
 */
export class ChatIdParamDTO {
  @IsNotEmpty({ message: "El ID de chat es requerido" })
  @IsUUID(4, { message: "El ID de chat debe ser un UUID válido" })
  chatId: string;
}

/**
 * DTO para enviar un mensaje
 * Valida que al menos texto o urlAdjunto esté presente (validación en servicio)
 */
export class EnviarMensajeDTO {
  @IsOptional()
  @IsString({ message: "El texto debe ser una cadena de caracteres" })
  @MaxLength(5000, {
    message: "El texto no puede exceder los 5000 caracteres",
  })
  texto?: string;

  @IsOptional()
  @IsString({ message: "La URL del adjunto debe ser una cadena de caracteres" })
  @IsUrl(
    {
      protocols: ["http", "https"],
      require_protocol: true,
    },
    { message: "La URL del adjunto debe ser una URL válida (http o https)" }
  )
  @MaxLength(2048, {
    message: "La URL del adjunto no puede exceder los 2048 caracteres",
  })
  urlAdjunto?: string;

  @ValidateIf((o) => !!o.urlAdjunto)
  @IsNotEmpty({
    message: "El tipo de adjunto es requerido cuando hay un adjunto",
  })
  @IsString({ message: "El tipo de adjunto debe ser una cadena de caracteres" })
  @Matches(
    /^(image|video|audio|application|text)\/[a-zA-Z0-9][a-zA-Z0-9!#$&\-\^_.]*$/,
    {
      message:
        "El tipo de adjunto debe ser un MIME type válido (ej: image/jpeg, video/mp4)",
    }
  )
  @MaxLength(100, {
    message: "El tipo de adjunto no puede exceder los 100 caracteres",
  })
  tipoAdjunto?: string;
}

/**
 * DTO para query parameters de paginación (opcional, para futuras mejoras)
 */
export class PaginacionQueryDTO {
  @IsOptional()
  @IsString()
  @Matches(/^\d+$/, { message: "La página debe ser un número entero positivo" })
  page?: string;

  @IsOptional()
  @IsString()
  @Matches(/^\d+$/, {
    message: "El límite debe ser un número entero positivo",
  })
  limit?: string;
}

/**
 * Interfaces de respuesta para TypeScript
 */
export interface MensajeResponse {
  id: string;
  chatId: string;
  remitenteId: string;
  texto: string | null;
  urlAdjunto: string | null;
  tipoAdjunto: string | null;
  creadoEn: Date;
  remitente: {
    id: string;
    email: string;
    rol: string;
  };
}

export interface ChatResponse {
  id: string;
  postulacionId: string;
  creadoEn: Date;
  postulacion: {
    id: string;
    titulo: string;
  };
  mensajes: MensajeResponse[];
}
