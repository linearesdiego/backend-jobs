import "dotenv/config";
import { PrismaMariaDb } from "@prisma/adapter-mariadb";
import { PrismaClient } from "@prisma/client";

// Singleton para evitar múltiples instancias de Prisma
declare global {
  var prisma: PrismaClient | undefined;
}

let prisma: PrismaClient;

const adapter = new PrismaMariaDb({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  connectionLimit: 5,
});

if (process.env.NODE_ENV === "production") {
  prisma = new PrismaClient({ adapter });
} else {
  if (!global.prisma) global.prisma = new PrismaClient({ adapter });
  prisma = global.prisma;
}

// Manejo de cierre de conexiones
process.on("beforeExit", async () => {
  await prisma.$disconnect();
});

export default prisma;
