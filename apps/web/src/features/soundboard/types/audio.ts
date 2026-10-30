// The subset of AudioBuffer the editor reads, so tests can pass plain objects.
export type AudioBufferLike = {
    numberOfChannels: number;
    sampleRate: number;
    length: number;
    getChannelData: (channel: number) => Float32Array<ArrayBuffer>;
};

export type AudioDecoder = {
    decodeAudioData: (data: ArrayBuffer) => Promise<AudioBufferLike>;
};

// A decoded source file, kept as raw channels so any range can be cut again.
export type DecodedSource = {
    channels: Float32Array<ArrayBuffer>[];
    sampleRate: number;
    // Samples in each channel.
    length: number;
    durationMs: number;
};

// The part of a File the editor reads, so a test can pass a plain object.
export type SourceFile = Pick<File, "name" | "type" | "size" | "arrayBuffer">;

// What the buffer cache needs to fetch and key a clip.
export type ClipSource = { id: string; fileUrl: string };

export type EncodeRequest = { samples: Float32Array; sampleRate: number };

export type EncodeResponse =
    { ok: true; bytes: Uint8Array<ArrayBuffer> } | { ok: false };
