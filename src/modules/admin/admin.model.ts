import { AdPlacement } from "@prisma/client";
import {
  IsEmail,
  IsNotEmpty,
  IsString,
  MinLength,
  IsEnum,
  IsOptional,
  IsBoolean,
  IsUrl,
} from "class-validator";

export class CreateModDTO {
  @IsNotEmpty({ message: "Email is required" })
  @IsEmail({}, { message: "Must be a valid email" })
  email: string;

  @IsNotEmpty({ message: "Password is required" })
  @IsString()
  @MinLength(6, { message: "Password must be at least 6 characters" })
  password: string;
}

export class CreateAdDTO {
  @IsNotEmpty({ message: "Title is required" })
  @IsString()
  title: string;

  @IsNotEmpty({ message: "Placement is required" })
  @IsEnum(AdPlacement, { message: "Invalid placement" })
  placement: AdPlacement;

  @IsOptional()
  @IsUrl({}, { message: "linkUrl must be a valid URL" })
  linkUrl?: string;
}

export class UpdateAdDTO {
  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsEnum(AdPlacement, { message: "Invalid placement" })
  placement?: AdPlacement;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @IsOptional()
  @IsUrl({}, { message: "linkUrl must be a valid URL" })
  linkUrl?: string;
}
