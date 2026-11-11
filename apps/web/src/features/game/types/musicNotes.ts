// One note, in world px and ms.
export type MusicNoteState = {
    // Where the note started; it sways around this column while it rises.
    originX: number;
    x: number;
    y: number;
    // Px per second, upward.
    riseSpeed: number;
    swayPhase: number;
    swaySpeed: number;
    swayAmplitude: number;
    rotation: number;
    colorIndex: number;
    ageMs: number;
    lifeMs: number;
};

// Where the notes of one playing avatar start. The key tells the avatars apart
// for their spawn timers.
export type MusicNoteSource = {
    key: string;
    feet: { x: number; y: number };
};

export type SpawnTimerStep = {
    remainingMs: number;
    shouldSpawn: boolean;
};
