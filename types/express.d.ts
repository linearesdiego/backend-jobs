import { JWTPayload } from "../src/modules/auth/auth.model";

export interface WideEvent {
  requestId: string;
  service: string;
  method: string;
  path: string;
  /** Internal — used to compute durationMs at request end */
  _startTime: number;

  // Populated by authMiddleware
  userId?: string;
  userRole?: string;

  // Populated at response finish
  statusCode?: number;
  durationMs?: number;

  // Populated by errorHandler
  error?: string;
  errorType?: string;
  errorCode?: number;

  // Request metadata
  ip?: string;
  userAgent?: string;
}

declare global {
  namespace Express {
    interface Request {
      user?: JWTPayload;
      wideEvent?: WideEvent;
    }
  }
}

export {};
