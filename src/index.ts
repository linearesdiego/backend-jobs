import dotenv from "dotenv";
dotenv.config();
import app from "./app";
import logger from "./utils/logger";

const PORT = process.env.PORT;

const server = app.listen(PORT, () => {
  logger.info(`Server running on port ${PORT}`);
});

// Manejo de errores del servidor
server.on("error", (error: any) => {
  logger.error(`Server error occurred: ${error.message}`);
});
