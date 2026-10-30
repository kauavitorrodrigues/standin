import { describe, expect, it } from "vitest";
import { createFakeRuntime } from "../../testing/createFakeRuntime";
import { askMissing } from "../askMissing";
import { canPrompt } from "../canPrompt";
import { writeFailure } from "../writeFailure";
import { writeSuccess } from "../writeSuccess";

const output = { result: { done: true }, lines: ["✓ one", "✓ two"] };
const report = { code: "SOME_CODE", message: "It broke.", fix: "Fix it." };

describe("writeSuccess", () => {
    it("prints the lines on stdout in human mode", () => {
        const { io, written } = createFakeRuntime();
        writeSuccess(io, "cmd", output, false);
        expect(written.out).toBe("✓ one\n✓ two\n");
        expect(written.err).toBe("");
    });

    it("prints one JSON document in json mode", () => {
        const { io, written } = createFakeRuntime();
        writeSuccess(io, "cmd", output, true);
        expect(JSON.parse(written.out)).toEqual({
            ok: true,
            command: "cmd",
            result: { done: true },
        });
        expect(written.out.trim().split("\n")).toHaveLength(1);
    });
});

describe("writeFailure", () => {
    it("prints the error on stderr in human mode", () => {
        const { io, written } = createFakeRuntime();
        writeFailure(io, report, false);
        expect(written.out).toBe("");
        expect(written.err).toContain("SOME_CODE");
        expect(written.err).toContain("It broke.");
        expect(written.err).toContain("fix: Fix it.");
    });

    it("prints the error as JSON on stdout in json mode", () => {
        const { io, written } = createFakeRuntime();
        writeFailure(io, report, true);
        expect(JSON.parse(written.out)).toEqual({ ok: false, error: report });
        expect(written.err).toBe("");
    });
});

describe("terminal detection", () => {
    it("prompts only with a terminal and without --json", () => {
        const tty = createFakeRuntime({ interactive: true }).io;
        const pipe = createFakeRuntime({ interactive: false }).io;
        expect(canPrompt(tty, {})).toBe(true);
        expect(canPrompt(tty, { json: true })).toBe(false);
        expect(canPrompt(pipe, {})).toBe(false);
    });

    it("never asks without a terminal", async () => {
        const { io } = createFakeRuntime({ answer: "x" });
        await expect(askMissing(io, {}, "Q?")).resolves.toBeUndefined();
        expect(io.ask).not.toHaveBeenCalled();
    });

    it("asks on a terminal and trims the answer", async () => {
        const { io } = createFakeRuntime({ interactive: true, answer: " a " });
        await expect(askMissing(io, {}, "Q?")).resolves.toBe("a");
    });
});
