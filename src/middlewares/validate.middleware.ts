import { Request, Response, NextFunction } from "express";
import { validate as classValidate, ValidationError } from "class-validator";
import { plainToClass } from "class-transformer";
import { CustomError } from "../utils/customError";

export function validate(dtoClass: any) {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const dtoInstance = plainToClass(dtoClass, req.body);
      const errors: ValidationError[] = await classValidate(dtoInstance);

      if (errors.length > 0) {
        const errorMessages = errors
          .map((error: ValidationError) => {
            return Object.values(error.constraints || {}).join(", ");
          })
          .join("; ");

        throw new CustomError(errorMessages, 400);
      }

      req.body = dtoInstance;
      next();
    } catch (error) {
      if (error instanceof CustomError) {
        next(error);
      } else {
        next(new CustomError("Error en la validación", 400));
      }
    }
  };
}
