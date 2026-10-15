import type { Request } from "express";

const PUBLISH_PATH = /^\/maps\/[^/]+\/publish\/?$/;

// The publish route reads its own body, with a bigger limit.
export const isPublishRequest = (req: Request): boolean =>
    req.method === "POST" && PUBLISH_PATH.test(req.path);
