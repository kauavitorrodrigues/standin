import type { WaveActivity } from "@/features/emotes/lib/WaveActivity";

// When the local person last waved at someone, on the clock of the page. A
// null means they have not.
export type WaveRecord = {
    sentAt: number | null;
};

// What the card of a person needs to wave at them.
export type PersonWave = {
    isPersonNear: (userId: string) => boolean;
    onWave: (userId: string) => void;
    activity: WaveActivity;
};

// What the card knows about waving at one person, at one moment.
export type WaveState = {
    // The wave to this person was just sent, so another one has to wait.
    isCoolingDown: boolean;
    // Milliseconds until the state changes by itself, or null if it will not.
    nextChangeMs: number | null;
};

// The person who waved, as far as the app knows them.
export type WavePerson = {
    name: string;
    profilePictureUrl: string | null;
};
