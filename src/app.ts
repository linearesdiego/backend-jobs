import cors from "cors";
import helmet from "helmet";
import express from "express";
import routes from "./routes";

const app = express();

// Middlewares básicos
app.use(helmet());
app.use(
  cors({
    origin: process.env.CORS_ORIGINS,
    credentials: true, // Importante para cookies
  })
);
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

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

export default app;
