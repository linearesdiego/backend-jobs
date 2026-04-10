import winston from "winston";

const isDev = process.env.NODE_ENV !== "production";

// Main logger — human-readable in dev, JSON in production
const logger = winston.createLogger({
  level: "info",
  format: isDev
    ? winston.format.combine(
        winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
        winston.format.colorize(),
        winston.format.printf(({ timestamp, level, message }) => {
          return `[${timestamp}] ${level}: ${message}`;
        })
      )
    : winston.format.combine(
        winston.format.timestamp(),
        winston.format.json()
      ),
  transports: [new winston.transports.Console()],
});

// Dedicated logger for wide events — always JSON so they're machine-parseable
export const wideEventLogger = winston.createLogger({
  level: "info",
  format: winston.format.combine(winston.format.timestamp(), winston.format.json()),
  transports: [new winston.transports.Console()],
});

export default logger;
