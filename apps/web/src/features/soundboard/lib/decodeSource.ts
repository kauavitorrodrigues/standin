import {
    SOUNDBOARD_EXTENSIONS,
    SOUNDBOARD_MAX_SOURCE_BYTES,
    SOUNDBOARD_MIME_TYPES,
} from "@standin/contracts";
import {
    SoundboardSourceTooLargeError,
    SoundboardSourceUndecodableError,
    SoundboardSourceUnsupportedError,
} from "../types/errors";
import type { AudioDecoder, DecodedSource, SourceFile } from "../types/audio";

const hasAcceptedExtension = (name: string): boolean =>
    SOUNDBOARD_EXTENSIONS.some((extension) =>
        name.toLowerCase().endsWith(extension)
    );

const hasAcceptedType = (type: string): boolean =>
    SOUNDBOARD_MIME_TYPES.some((accepted) => accepted === type);

const isAcceptedFile = (file: Pick<SourceFile, "name" | "type">): boolean =>
    hasAcceptedType(file.type) ||
    // Some systems send no type for an mp3.
    (file.type === "" && hasAcceptedExtension(file.name));

/**
 * Reads a source file into raw channels. The size and the type are checked
 * before the file is read, and a file the browser cannot decode is reported
 * as such instead of leaking the DOMException.
 */
export const decodeSourceFile = async (
    file: SourceFile,
    decoder: AudioDecoder
): Promise<DecodedSource> => {
    if (file.size > SOUNDBOARD_MAX_SOURCE_BYTES) {
        throw new SoundboardSourceTooLargeError();
    }
    if (!isAcceptedFile(file)) throw new SoundboardSourceUnsupportedError();

    const buffer = await decoder
        .decodeAudioData(await file.arrayBuffer())
        .catch(() => null);
    if (!buffer || buffer.length === 0) {
        throw new SoundboardSourceUndecodableError();
    }

    return {
        channels: Array.from({ length: buffer.numberOfChannels }, (_, index) =>
            buffer.getChannelData(index)
        ),
        sampleRate: buffer.sampleRate,
        length: buffer.length,
        durationMs: (buffer.length / buffer.sampleRate) * 1000,
    };
};
