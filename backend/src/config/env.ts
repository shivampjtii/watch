import dotenv from "dotenv";

dotenv.config();

const requiredEnvVariables = [
  "PORT",
  "MONGODB_URI",
  "JWT_SECRET",
];

for (const variable of requiredEnvVariables) {
  if (!process.env[variable]) {
    throw new Error(
      `Missing required environment variable: ${variable}`
    );
  }
}

export const env = {
  port: Number(process.env.PORT),
  mongodbUri: process.env.MONGODB_URI as string,
    jwtSecret: process.env.JWT_SECRET as string,
  corsOrigin:
        process.env.CORS_ORIGIN || "*",
  nodeEnv:
  process.env.NODE_ENV || "development",
};