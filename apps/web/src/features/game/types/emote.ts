// How one floating emoji moves, in world px and ms. Speeds are px per second.
export type EmoteParticleMotion = {
    velocityX: number;
    velocityY: number;
    // How long it waits before it shows and starts to move.
    delayMs: number;
    lifeMs: number;
};

export type EmoteParticleState = EmoteParticleMotion & {
    x: number;
    y: number;
    ageMs: number;
};

// What FIRE_EMOJI carries: where the emojis start, in world px, with no offset
// from a body.
export type FireEmojiEvent = {
    x: number;
    y: number;
    emoji: string;
    count: number;
};

// The parts of a Phaser canvas texture the emoji is drawn on.
export type EmojiCanvas = {
    context: CanvasRenderingContext2D;
    refresh: () => unknown;
    setFilter: (mode: number) => unknown;
};

// The parts of a Phaser scene the texture cache needs, so it can run without
// one.
export type EmojiTextureHost = {
    textures: {
        exists: (key: string) => boolean;
        remove: (key: string) => unknown;
        createCanvas: (
            key: string,
            width: number,
            height: number
        ) => EmojiCanvas | null;
    };
};
