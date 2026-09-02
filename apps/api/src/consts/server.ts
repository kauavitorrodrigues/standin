import type { CorsOptions } from "cors";

const FRONTEND_ORIGIN = process.env.FRONTEND_URL || "http://localhost:5173";

export const httpCorsOptions: CorsOptions = {
    origin: FRONTEND_ORIGIN,
    credentials: true,
};

export const corsSocketOptions: CorsOptions = {
    origin: FRONTEND_ORIGIN,
    credentials: true,
};
