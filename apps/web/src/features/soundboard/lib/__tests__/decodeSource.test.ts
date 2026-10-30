import { describe, expect, it, vi } from "vitest";
import { SOUNDBOARD_MAX_SOURCE_BYTES } from "@standin/contracts";
import { decodeSourceFile } from "../decodeSource";
import {
    SoundboardSourceTooLargeError,
    SoundboardSourceUndecodableError,
    SoundboardSourceUnsupportedError,
} from "../../types/errors";
import type { AudioBufferLike, SourceFile } from "../../types/audio";

const makeFile = (overrides: Partial<SourceFile> = {}): SourceFile => ({
    name: "song.mp3",
    type: "audio/mpeg",
    size: 1000,
    arrayBuffer: () => Promise.resolve(new ArrayBuffer(8)),
    ...overrides,
});

const makeBuffer = (length = 2000): AudioBufferLike => ({
    numberOfChannels: 2,
    sampleRate: 1000,
    length,
    getChannelData: () => new Float32Array(length),
});

describe("decodeSourceFile", () => {
    it("decodes the channels, the rate and the duration", async () => {
        const decoder = {
            decodeAudioData: vi.fn(() => Promise.resolve(makeBuffer())),
        };

        const decoded = await decodeSourceFile(makeFile(), decoder);

        expect(decoded.channels).toHaveLength(2);
        expect(decoded.sampleRate).toBe(1000);
        expect(decoded.durationMs).toBe(2000);
    });

    it("accepts a file with no declared type when the extension is mp3", async () => {
        const decoder = {
            decodeAudioData: () => Promise.resolve(makeBuffer()),
        };

        await expect(
            decodeSourceFile(makeFile({ type: "" }), decoder)
        ).resolves.toBeDefined();
    });

    it("refuses a source over the size limit before reading it", async () => {
        const arrayBuffer = vi.fn();
        const decoder = { decodeAudioData: vi.fn() };

        await expect(
            decodeSourceFile(
                makeFile({
                    size: SOUNDBOARD_MAX_SOURCE_BYTES + 1,
                    arrayBuffer,
                }),
                decoder
            )
        ).rejects.toBeInstanceOf(SoundboardSourceTooLargeError);
        expect(arrayBuffer).not.toHaveBeenCalled();
    });

    it("accepts a source exactly at the size limit", async () => {
        const decoder = {
            decodeAudioData: () => Promise.resolve(makeBuffer()),
        };

        await expect(
            decodeSourceFile(
                makeFile({ size: SOUNDBOARD_MAX_SOURCE_BYTES }),
                decoder
            )
        ).resolves.toBeDefined();
    });

    it("refuses a file that is not an mp3", async () => {
        const decoder = { decodeAudioData: vi.fn() };

        await expect(
            decodeSourceFile(
                makeFile({ type: "image/png", name: "pic.png" }),
                decoder
            )
        ).rejects.toBeInstanceOf(SoundboardSourceUnsupportedError);
        expect(decoder.decodeAudioData).not.toHaveBeenCalled();
    });

    it("reports a file the decoder rejects as undecodable", async () => {
        const decoder = {
            decodeAudioData: () => Promise.reject(new DOMException("bad")),
        };

        await expect(
            decodeSourceFile(makeFile(), decoder)
        ).rejects.toBeInstanceOf(SoundboardSourceUndecodableError);
    });

    it("reports a decode that yields no samples as undecodable", async () => {
        const decoder = {
            decodeAudioData: () => Promise.resolve(makeBuffer(0)),
        };

        await expect(
            decodeSourceFile(makeFile(), decoder)
        ).rejects.toBeInstanceOf(SoundboardSourceUndecodableError);
    });
});
