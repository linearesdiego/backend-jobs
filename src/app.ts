import cors from "cors";
import helmet from "helmet";
import express from "express";
import path from "path";
import routes from "./routes";
import { errorHandler } from "./middlewares/error.middleware";
import { wideEventMiddleware } from "./middlewares/wideEvent.middleware";
import { env } from "./config/env";
import { UPLOADS_PATH } from "./middlewares/upload.middleware";

const app = express();

// Wide event middleware — must be first to capture full request duration
app.use(wideEventMiddleware);

// Middlewares básicos
const corsOptions = {
  origin:
    "http://videojobs-testing-frontend-uo7ugp-6ce51d-2-24-117-14.sslip.io/", // now an explicit URL, not "*"
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
};
console.log("🔍 CORS origin loaded as:", env.FRONTEND_URL);
app.use(cors(corsOptions));
app.options("*", cors(corsOptions)); // ✅ same config, not bare cors() // ✅ Explicitly handle preflight for ALL routes

app.use(
  helmet({
    crossOriginOpenerPolicy: false,
    crossOriginResourcePolicy: false,
  }),
);
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

app.get("/health", (_req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

if (env.NODE_ENV !== "production") {
  app.use(
    "/uploads",
    (_req, res, next) => {
      res.setHeader("Cross-Origin-Resource-Policy", "cross-origin");
      next();
    },
    express.static(path.resolve(UPLOADS_PATH)),
  );
}

// Rutas principales
app.use("/api/v1", routes);

// Manejo de rutas no encontradas
app.use((req, res, next) => {
  if (!res.headersSent) {
    res.status(404).json({
      success: false,
      message: "Ruta no encontrada",
      error: "NOT_FOUND",
      path: req.path,
    });
  }
});

// Middleware de manejo de errores (debe ir al final)
app.use(errorHandler);

export default app;
