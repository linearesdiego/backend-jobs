import fs from "fs/promises";
import path from "path";
import { env } from "../config/env";

export function buildPublicUrl(subdir: string, filename: string): string {
  return `/uploads/${subdir}/${filename}`;
}

export async function deleteFile(publicUrl: string): Promise<void> {
  const relativePath = publicUrl.replace(/^\/uploads\//, "");
  const absolutePath = path.join(env.UPLOADS_PATH, relativePath);
  try {
    await fs.unlink(absolutePath);
  } catch (err: any) {
    if (err.code !== "ENOENT") throw err;
  }
}
