import { describe, expect, it, vi } from "vitest";
import type { Response } from "express";
import {
    LAYOUT_ISSUE_CODES,
    LayoutValidationError,
    LockNotHeldError,
    MapLockedError,
    PublishTooManyOpsError,
    PublishValidationError,
    StaleLayoutVersionError,
    createIssue,
} from "@standin/contracts";
import { sendError } from "../sendError";

const createResponse = () => {
    const json = vi.fn();
    const status = vi.fn(() => ({ json }));
    return { res: { status } as unknown as Response, status, json };
};

describe("sendError", () => {
    it("answers a layout validation error with every error and warning", () => {
        const { res, status, json } = createResponse();
        const error = new LayoutValidationError(
            [
                createIssue(
                    LAYOUT_ISSUE_CODES.SPAWN_MISSING,
                    "zones",
                    "sem spawn"
                ),
            ],
            [
                createIssue(
                    LAYOUT_ISSUE_CODES.TOO_MANY_TILESETS,
                    "tilesets",
                    "muitos"
                ),
            ]
        );

        vi.spyOn(console, "error").mockImplementation(() => undefined);
        sendError({ res, reportError: error });

        expect(status).toHaveBeenCalledWith(422);
        expect(json).toHaveBeenCalledWith({
            error: "sem spawn",
            errors: error.errors,
            warnings: error.warnings,
        });
    });

    it("answers a stale layout with the version to reload", () => {
        const { res, status, json } = createResponse();

        vi.spyOn(console, "error").mockImplementation(() => undefined);
        sendError({ res, reportError: new StaleLayoutVersionError(13) });

        expect(status).toHaveBeenCalledWith(409);
        expect(json).toHaveBeenCalledWith(
            expect.objectContaining({
                code: LAYOUT_ISSUE_CODES.STALE_LAYOUT_VERSION,
                version: 13,
            })
        );
    });

    it("answers a locked map with 423, who holds it and since when", () => {
        const { res, status, json } = createResponse();
        const by = { id: "user-1", name: "Ana" };
        const since = "2026-01-01T00:00:00.000Z";

        vi.spyOn(console, "error").mockImplementation(() => undefined);
        sendError({ res, reportError: new MapLockedError(by, since) });

        expect(status).toHaveBeenCalledWith(423);
        expect(json).toHaveBeenCalledWith({
            error: "Map is locked by another editor.",
            code: "MAP_LOCKED",
            by,
            since,
        });
    });

    it("answers a lost lock with 423 and its code", () => {
        const { res, status, json } = createResponse();

        vi.spyOn(console, "error").mockImplementation(() => undefined);
        sendError({ res, reportError: new LockNotHeldError() });

        expect(status).toHaveBeenCalledWith(423);
        expect(json).toHaveBeenCalledWith({
            error: "Editor session does not hold the map lock.",
            code: "LOCK_NOT_HELD",
        });
    });

    it("answers a publish validation error with the failing operation", () => {
        const { res, status, json } = createResponse();
        const issue = {
            opIndex: 2,
            code: "CELL_OUT_OF_BOUNDS",
            path: "999,0",
            message: "out",
        };

        vi.spyOn(console, "error").mockImplementation(() => undefined);
        sendError({
            res,
            reportError: new PublishValidationError([issue]),
        });

        expect(status).toHaveBeenCalledWith(422);
        expect(json).toHaveBeenCalledWith({
            error: "The draft has an operation that cannot be applied.",
            code: "PUBLISH_INVALID",
            errors: [issue],
        });
    });

    it("answers a draft over the limit with 413 and OP_TOO_LARGE", () => {
        const { res, status, json } = createResponse();

        vi.spyOn(console, "error").mockImplementation(() => undefined);
        sendError({ res, reportError: new PublishTooManyOpsError() });

        expect(status).toHaveBeenCalledWith(413);
        expect(json).toHaveBeenCalledWith({
            error: "The draft has too many operations to publish at once.",
            code: "OP_TOO_LARGE",
        });
    });
});
