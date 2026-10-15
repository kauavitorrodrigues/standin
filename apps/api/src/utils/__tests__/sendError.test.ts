import { describe, expect, it, vi } from "vitest";
import type { Response } from "express";
import {
    LAYOUT_ISSUE_CODES,
    LayoutValidationError,
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
});
