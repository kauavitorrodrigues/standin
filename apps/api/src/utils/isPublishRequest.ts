import type { Request } from "express";

const PUBLISH_PATH = /^\/maps\/[^/]+\/(?:publish|apply)\/?$/;

// The publish and apply routes read their own body, with a bigger limit.
export const isPublishRequest = (req: Request): boolean =>
    req.method === "POST" && PUBLISH_PATH.test(req.path);
