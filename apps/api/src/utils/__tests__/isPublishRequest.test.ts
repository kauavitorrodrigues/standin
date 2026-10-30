import { describe, expect, it } from "vitest";
import type { Request } from "express";
import { isPublishRequest } from "../isPublishRequest";

const req = (method: string, path: string) => ({ method, path }) as Request;

describe("isPublishRequest", () => {
    it.each([
        ["POST", "/maps/m1/publish"],
        ["POST", "/maps/m1/apply"],
        ["POST", "/maps/m1/publish/"],
        ["POST", "/maps/m1/apply/"],
    ])("reads its own body for %s %s", (method, path) => {
        expect(isPublishRequest(req(method, path))).toBe(true);
    });

    it.each([
        ["GET", "/maps/m1/apply"],
        ["GET", "/maps/m1/publish"],
        ["POST", "/maps/m1/apply/extra"],
        ["POST", "/maps/m1/assets"],
        ["POST", "/maps//apply"],
        ["POST", "/spaces/m1/apply"],
    ])("leaves %s %s to the global reader", (method, path) => {
        expect(isPublishRequest(req(method, path))).toBe(false);
    });
});
