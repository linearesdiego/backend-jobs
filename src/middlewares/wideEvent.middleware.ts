import { Request, Response, NextFunction } from "express";
import { randomUUID } from "crypto";
import { wideEventLogger } from "../utils/logger";
import type { WideEvent } from "../../types/express";

/**
 * Tail sampling thresholds.
 * - Always retain: 5xx errors and slow requests.
 * - Randomly sample: 5% of healthy, fast requests.
 */
const SLOW_REQUEST_THRESHOLD_MS = 1000;
const SAMPLE_RATE = 0.05;

function shouldRetain(event: WideEvent & { statusCode: number; durationMs: number }): boolean {
  if (event.statusCode >= 500) return true;
  if (event.durationMs >= SLOW_REQUEST_THRESHOLD_MS) return true;
  return Math.random() < SAMPLE_RATE;
}

export function wideEventMiddleware(req: Request, res: Response, next: NextFunction): void {
  req.wideEvent = {
    requestId: randomUUID(),
    service: "backend-jobs",
    method: req.method,
    path: req.path,
    _startTime: Date.now(),
    ip: req.ip ?? req.socket.remoteAddress,
    userAgent: req.headers["user-agent"],
  };

  res.on("finish", () => {
    const event = req.wideEvent;
    if (!event) return;

    const durationMs = Date.now() - event._startTime;
    const statusCode = res.statusCode;

    // Destructure out _startTime so it's never emitted
    const { _startTime, ...rest } = event;
    const finalEvent = { ...rest, statusCode, durationMs };

    if (shouldRetain({ ...event, statusCode, durationMs })) {
      wideEventLogger.info("http_request", finalEvent);
    }
  });

  next();
}
