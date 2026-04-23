const NEXT_PUBLIC_API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;
const NEXT_PUBLIC_APP_NAME = process.env.NEXT_PUBLIC_APP_NAME;

if (!NEXT_PUBLIC_API_BASE_URL || NEXT_PUBLIC_API_BASE_URL.trim() === "") {
  throw new Error("Missing required environment variable: NEXT_PUBLIC_API_BASE_URL");
}

export const env = {
  apiBaseUrl: NEXT_PUBLIC_API_BASE_URL,
  appName: NEXT_PUBLIC_APP_NAME || "Calificaciones UP",
};