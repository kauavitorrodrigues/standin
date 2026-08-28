import { createServer } from "node:http";
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import router from "./router";
import { validateEnv } from "@/utils/validateEnv";

validateEnv(["JWT_SECRET", "DATABASE_URL"]);

const app = express();

app.use(
    cors({
        origin: process.env.FRONTEND_URL || "http://localhost:5173",
        credentials: true,
    }),
);
app.use(express.json());
app.use(cookieParser());
app.use(router);

const server = createServer(app);

const PORT = process.env.SERVER_PORT || 3001;

server.listen(PORT, () => {
    console.log(`✓ [API] - Server is running at: http://localhost:${PORT}`);
});
