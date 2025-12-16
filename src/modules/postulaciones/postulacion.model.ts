import { PostulacionEstado } from "@prisma/client";
import {
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from "class-validator";

export class CrearPostulacionDTO {
  @IsNotEmpty()
  @IsString()
  @MinLength(5)
  @MaxLength(100)
  titulo: string;
  @IsNotEmpty()
  @IsString()
  @MinLength(10)
  @MaxLength(1000)
  descripcion: string;

  @IsNotEmpty()
  @IsString()
  categoria?: string;

  @IsOptional()
  @IsNumber()
  precioEstimado?: number;
}

export class ActualizarPostulacionDTO {
  @IsOptional()
  @IsString()
  @MinLength(5)
  @MaxLength(100)
  titulo?: string;

  @IsOptional()
  @IsString()
  @MinLength(10)
  @MaxLength(1000)
  descripcion?: string;

  @IsOptional()
  @IsString()
  categoria?: string;

  @IsOptional()
  @IsNumber()
  precioEstimado?: number;

  @IsOptional()
  @IsString()
  estado?: PostulacionEstado;
}

export class FiltrosPostulaciones {
  @IsOptional()
  @IsString()
  categoria?: string;

  @IsOptional()
  @IsString()
  estado?: PostulacionEstado;

  @IsOptional()
  @IsString()
  busqueda?: string;
}
