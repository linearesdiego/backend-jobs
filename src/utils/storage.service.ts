import fs from "fs/promises";
import path from "path";
import { env } from "../config/env";
import { CustomError } from "../utils/customError";

export function buildPublicUrl(subdir: string, filename: string): string {
  return `/uploads/${subdir}/${filename}`;
}

export async function deleteFile(publicUrl: string): Promise<void> {
  const relativePath = publicUrl.replace(/^\/uploads\//, "");
  const uploadsRoot = path.resolve(env.UPLOADS_PATH);
  const absolutePath = path.resolve(env.UPLOADS_PATH, relativePath);

  if (!absolutePath.startsWith(uploadsRoot + path.sep)) {
    throw new CustomError("Invalid file path", 400);
  }

  try {
    await fs.unlink(absolutePath);
  } catch (err) {
    if ((err as NodeJS.ErrnoException).code !== "ENOENT") throw err;
  }
}
