import type {
    MediaPauseReason,
    ProximityMagnitude,
    ProximityPreset,
} from "@standin/contracts";

export type ProducerKind = "audio" | "camera" | "screen" | "screen-audio";

export type SimulcastLayer = "low" | "mid" | "high";

// "ambient" is the hook for awareness without a decoded stream. The planner
// only emits "strong" for now.
export type ConnectionType = "strong" | "ambient";

export type PersonState = {
    id: string;
    // Key of the private room the person stands in, null outside every room.
    roomKey: string | null;
    // A muted person gets no audio consumer for others. Their screen audio is
    // not affected.
    muted: boolean;
    // Headphones on: the person has no connection with anybody, in both
    // directions, for audio and video.
    headphones: boolean;
    // Focus mode. Stored and shown, it does not change strong connections.
    focusMode: boolean;
    // Active producer id per kind, absent when the person is not producing it.
    producers: Partial<Record<ProducerKind, string>>;
};

export type CurrentConsumer = {
    personId: string;
    producerId: string;
    kind: ProducerKind;
    // Null for kinds that are not simulcast (audio, screen, screen-audio).
    layer: SimulcastLayer | null;
    paused: boolean;
    // Why it is paused, null when it is not. A consumer that was held back for
    // one reason and is now held for another is told again.
    pauseReason?: MediaPauseReason | null;
};

export type DesiredConsumer = CurrentConsumer & {
    connection: ConnectionType;
};

// What the magnitude rules see of one side of a pair.
export type RulePlayer = Pick<
    PersonState,
    "id" | "roomKey" | "headphones" | "focusMode"
>;

export type MagnitudeRule = (
    playerA: RulePlayer,
    playerB: RulePlayer,
    mag: ProximityMagnitude
) => ProximityMagnitude;

// Read side of the SpatialGrid in apps/api/src/lib/socket/presence, kept
// structural so the planner has no dependency on the api.
export type PositionSource = {
    get(id: string): { x: number; y: number } | undefined;
};

export type PlannerConfig = {
    loudestSpeakers: number;
    carouselSize: number;
    audioEnterRadius: number;
    audioExitRadius: number;
    videoEnterRadius: number;
    videoExitRadius: number;
    pxPerTile: number;
    preset: ProximityPreset;
    videoPauseMagnitude: number;
    // Video consumers that play at once. The ones beyond it, up to the
    // carousel, are kept paused for the receiver (a weak machine asked for
    // less) so a tile can say so and play again at once.
    activeVideoLimit: number;
    // How many of the lowest priority videos of each receiver the server holds
    // back because it is short of CPU. Never a pinned person or one of the
    // loudest speakers, and never audio.
    videoShed: number;
    minChangeIntervalMs: number;
    rules: readonly MagnitudeRule[];
};

export type PlanInput = {
    // Clock reading in ms, injected so the planner stays pure.
    now: number;
    positions: PositionSource;
    people: readonly PersonState[];
    // Loudest first.
    speakers: readonly string[];
    // Receivers to plan, from the SpatialGrid dirty set.
    dirtyIds: ReadonlySet<string>;
    // Consumers each receiver holds right now.
    current: ReadonlyMap<string, readonly CurrentConsumer[]>;
    // When each receiver last had a change applied.
    lastChangeAt: ReadonlyMap<string, number>;
    // The layer each receiver asks for per person, a person left out gets low.
    focus?: ReadonlyMap<string, ReadonlyMap<string, SimulcastLayer>>;
    // The people each receiver pinned, in pin order. A pinned person that is
    // within the video reach sorts before everything else for the video slots.
    pins?: ReadonlyMap<string, readonly string[]>;
    // The people each receiver hid. Their video is worth nothing to that
    // receiver, so no video consumer is kept for the pair.
    hiddenVideo?: ReadonlyMap<string, ReadonlySet<string>>;
    config?: Partial<PlannerConfig>;
};

export type LayerChange = { producerId: string; layer: SimulcastLayer };

export type PauseChange = { producerId: string; reason: MediaPauseReason };

export type ReceiverPlan = {
    receiverId: string;
    desired: DesiredConsumer[];
    create: DesiredConsumer[];
    close: CurrentConsumer[];
    pause: PauseChange[];
    // Consumers that stay paused for another reason than they were.
    retag: PauseChange[];
    resume: string[];
    setLayer: LayerChange[];
    // Hidden people who are out of the reach of the video, or gone: the hiding
    // ends, so they show again when they come back.
    releasedHidden: string[];
    changed: boolean;
};

export type PlanResult = {
    // Sorted by receiver id.
    plans: ReceiverPlan[];
    // Receivers held back by the debounce, to keep in the dirty set.
    deferred: string[];
};
