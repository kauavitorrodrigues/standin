import { describe, expect, it } from "vitest";
import {
    SfuEmptyAnswerError,
    SfuRequestRejectedError,
    SfuRequestTimeoutError,
} from "../../errors";
import { readSfuAnswer } from "../readSfuAnswer";

describe("readSfuAnswer", () => {
    it("gives back an answer that succeeded", () => {
        const answer = { ok: true as const, producerId: "p" };
        expect(readSfuAnswer(null, answer)).toBe(answer);
    });

    it("throws a timeout when the socket reports an error", () => {
        expect(() => readSfuAnswer(new Error("timeout"), undefined)).toThrow(
            SfuRequestTimeoutError
        );
    });

    it("throws an empty answer error when nothing came back", () => {
        expect(() => readSfuAnswer(null, undefined)).toThrow(SfuEmptyAnswerError);
    });

    it("throws the code the server refused with", () => {
        try {
            readSfuAnswer(null, { ok: false, code: "MEDIA_TRANSPORT_EXISTS" });
            expect.unreachable();
        } catch (error) {
            expect(error).toBeInstanceOf(SfuRequestRejectedError);
            expect((error as SfuRequestRejectedError).code).toBe("MEDIA_TRANSPORT_EXISTS");
        }
    });

    it("uses UNKNOWN when the server gave no code", () => {
        try {
            readSfuAnswer(null, { ok: false });
            expect.unreachable();
        } catch (error) {
            expect((error as SfuRequestRejectedError).code).toBe("UNKNOWN");
        }
    });
});
