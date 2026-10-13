import path from "node:path";
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import router from "./router";
import { httpCorsOptions } from "@/consts/server";

// The HTTP app on its own, so the server and the integration tests mount the
// exact same stack.
export const createApp = () => {
    const app = express();

    app.use(cors(httpCorsOptions));
    app.use(express.json());
    app.use(cookieParser());
    app.use("/public", express.static(path.join(process.cwd(), "public")));
    app.use(router);

    return app;
};
