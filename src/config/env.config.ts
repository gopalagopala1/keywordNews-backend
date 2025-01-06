import dotenv from "dotenv";
import path from "path";

// Load .env file from project root
dotenv.config({ path: path.resolve(__dirname, "../../.env") });

interface EnvironmentVariables {
  NODE_ENV: string;
  PORT: number;
  GEMINI_MODEL: string;
  GEMINI_API_KEY: string;
  SUPABASE_URL: string;
  NEWS_API_URL: string;
  SUPABASE_API_KEY: string;
  NEWS_API_KEY: string
}

export const env: EnvironmentVariables = {
  NODE_ENV: process.env.NODE_ENV || "development",
  PORT: parseInt(process.env.PORT || "8080", 10),
  GEMINI_MODEL: process.env.GEMINI_MODEL as string,
  GEMINI_API_KEY: process.env.GEMINI_API_KEY as string,
  SUPABASE_URL: process.env.SUPABASE_URL as string,
  NEWS_API_URL: process.env.NEWS_API_URL as string,
  SUPABASE_API_KEY: process.env.SUPABASE_API_KEY as string,
  NEWS_API_KEY: process.env.NEWS_API_KEY as string
};

const requiredEnvVars: Array<keyof EnvironmentVariables> = [
  "GEMINI_MODEL",
  "GEMINI_API_KEY",
  "SUPABASE_URL",
  "NEWS_API_URL",
  "SUPABASE_API_KEY",
  "NEWS_API_KEY"
];

// Check for missing required variables
const missingEnvVars = requiredEnvVars.filter((envVar) => !env[envVar]);

if (missingEnvVars.length > 0) {
  throw new Error(
    `Missing required environment variables: ${missingEnvVars.join(", ")}`
  );
}

export default env;
