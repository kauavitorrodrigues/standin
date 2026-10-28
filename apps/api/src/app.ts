import path from "node:path";
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { getStorageDriver, STORAGE_DRIVERS } from "@standin/infra";
import router from "./router";
import { httpCorsOptions } from "@/consts/server";
import { isPublishRequest } from "@/utils/isPublishRequest";

// The HTTP app on its own, so the server and the integration tests mount the
// exact same stack.
export const createApp = () => {
    const app = express();

    app.use(cors(httpCorsOptions));
    app.use(
        express.json({
            type: (req) =>
                !isPublishRequest(req as express.Request) &&
                Boolean((req as express.Request).is("application/json")),
        })
    );
    app.use(cookieParser());
    // With an external bucket nothing is read from disk, and mounting it would
    // keep serving any copy left there without the access checks.
    if (getStorageDriver() === STORAGE_DRIVERS.LOCAL) {
        app.use("/public", express.static(path.join(process.cwd(), "public")));
    }
    app.use(router);

    return app;
};
