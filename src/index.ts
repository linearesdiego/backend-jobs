import dotenv from "dotenv";
dotenv.config();
import app from "./app";
import logger from "./utils/logger";

const PORT = process.env.PORT;

const server = app.listen(PORT, () => {
  logger.info(`Server running on port ${PORT}`);
  
  // Conexión a la base de datos
  import("./config/prisma")
    .then(() => {
      logger.info("Connected to the database successfully.");
    })
    .catch((error) => {
      logger.error(`Database connection error: ${error.message}`);
    });
});

// Manejo de errores del servidor
server.on("error", (error: any) => {
  logger.error(`Server error occurred: ${error.message}`);
});
