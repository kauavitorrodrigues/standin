import { vi } from "vitest";

// A graph that records its connections and holds the values the mixer sets,
// enough to check what reaches the published stream and what does not.
export type FakeNode = {
    name: string;
    connect: ReturnType<typeof vi.fn>;
    disconnect: ReturnType<typeof vi.fn>;
};

const createNode = (name: string): FakeNode => ({
    name,
    connect: vi.fn(),
    disconnect: vi.fn(),
});

export const createFakeAudioContext = () => {
    const publishedTrack = { enabled: true, stop: vi.fn() };
    const published = {
        getAudioTracks: () => [publishedTrack],
        getTracks: () => [publishedTrack],
    } as unknown as MediaStream;

    // The first gain is the microphone one, the others belong to clips.
    const gains: Array<FakeNode & { gain: { value: number } }> = [];
    const sources: Array<
        FakeNode & {
            buffer: unknown;
            start: ReturnType<typeof vi.fn>;
            stop: ReturnType<typeof vi.fn>;
            onended: (() => void) | null;
        }
    > = [];
    const limiters: Array<
        FakeNode &
            Record<
                "threshold" | "knee" | "ratio" | "attack" | "release",
                { value: number }
            >
    > = [];
    const destinationNode = { ...createNode("speakers") };
    const mediaDestination = { ...createNode("published"), stream: published };

    const context = {
        state: "running" as AudioContextState,
        destination: destinationNode,
        createBuffer: vi.fn(() => ({})),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        resume: vi.fn(() => Promise.resolve()),
        close: vi.fn(() => Promise.resolve()),
        createMediaStreamSource: vi.fn(() => createNode("mic")),
        createGain: vi.fn(() => {
            const node = { ...createNode("gain"), gain: { value: 1 } };
            gains.push(node);
            return node;
        }),
        createDynamicsCompressor: vi.fn(() => {
            const node = {
                ...createNode("limiter"),
                threshold: { value: 0 },
                knee: { value: 0 },
                ratio: { value: 0 },
                attack: { value: 0 },
                release: { value: 0 },
            };
            limiters.push(node);
            return node;
        }),
        createMediaStreamDestination: vi.fn(() => mediaDestination),
        createBufferSource: vi.fn(() => {
            const source = {
                ...createNode("clip"),
                buffer: null as unknown,
                start: vi.fn(),
                stop: vi.fn(),
                onended: null as (() => void) | null,
            };
            sources.push(source);
            return source;
        }),
    };

    return {
        context: context as unknown as AudioContext,
        raw: context,
        gains,
        limiters,
        get gain() {
            return gains[0]!;
        },
        publishedTrack,
        sources,
        mediaDestination,
        destinationNode,
    };
};

export const createFakeMicStream = () => {
    const track = {
        stop: vi.fn(),
        enabled: true,
        getSettings: () => ({ sampleRate: 48000 }),
    };
    return {
        track,
        stream: {
            getTracks: () => [track],
            getAudioTracks: () => [track],
        } as unknown as MediaStream,
    };
};
