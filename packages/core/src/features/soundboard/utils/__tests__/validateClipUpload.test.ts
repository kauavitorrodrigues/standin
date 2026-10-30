import { describe, expect, it } from "vitest";
import {
    SOUNDBOARD_MAX_CLIP_BYTES,
    SoundboardClipTooLongError,
    SoundboardClipTooShortError,
    SoundboardFileMissingError,
    SoundboardFileTooLargeError,
    SoundboardNameInvalidError,
    SoundboardUnsupportedFormatError,
} from "@standin/contracts";
import { validateClipUpload } from "../validateClipUpload";
import { buildMp3 } from "./mp3Fixtures";

const upload = (
    overrides: Partial<Parameters<typeof validateClipUpload>[0]>
) => ({
    buffer: buildMp3(40),
    originalName: "clip.mp3",
    mimeType: "audio/mpeg",
    ...overrides,
});

describe("validateClipUpload", () => {
    it("returns the trimmed name and the duration read from the bytes", () => {
        const valid = validateClipUpload(upload({}), "  Aplausos  ");

        expect(valid.name).toBe("Aplausos");
        expect(valid.durationMs).toBe(1045);
    });

    it("refuses a request with no file", () => {
        expect(() => validateClipUpload(undefined, "x")).toThrow(
            SoundboardFileMissingError
        );
    });

    it.each([[""], ["   "], ["a".repeat(41)], [undefined], [12]])(
        "refuses the name %j",
        (name) => {
            expect(() => validateClipUpload(upload({}), name)).toThrow(
                SoundboardNameInvalidError
            );
        }
    );

    it("refuses a file over the size limit before reading it", () => {
        const big = Buffer.alloc(SOUNDBOARD_MAX_CLIP_BYTES + 1);

        expect(() => validateClipUpload(upload({ buffer: big }), "x")).toThrow(
            SoundboardFileTooLargeError
        );
    });

    it("refuses another declared type or extension", () => {
        expect(() =>
            validateClipUpload(upload({ mimeType: "audio/wav" }), "x")
        ).toThrow(SoundboardUnsupportedFormatError);
        expect(() =>
            validateClipUpload(upload({ originalName: "clip.wav" }), "x")
        ).toThrow(SoundboardUnsupportedFormatError);
    });

    it("refuses bytes that are not an mp3 even with the right type", () => {
        expect(() =>
            validateClipUpload(upload({ buffer: Buffer.alloc(5000) }), "x")
        ).toThrow(SoundboardUnsupportedFormatError);
    });

    it("refuses a clip shorter than the minimum", () => {
        expect(() =>
            validateClipUpload(upload({ buffer: buildMp3(2) }), "x")
        ).toThrow(SoundboardClipTooShortError);
    });

    it("refuses a clip over 10 s and allows the encoder padding", () => {
        // 400 frames = 10.4 s, past the 100 ms tolerance; 384 = 10.03 s, inside it.
        expect(() =>
            validateClipUpload(upload({ buffer: buildMp3(400) }), "x")
        ).toThrow(SoundboardClipTooLongError);
        expect(
            validateClipUpload(upload({ buffer: buildMp3(384) }), "x")
                .durationMs
        ).toBeGreaterThan(10_000);
    });
});
