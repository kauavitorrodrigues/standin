import type { ProximityMagnitude, ProximityPreset } from "@standin/contracts";

export type ProducerKind = "audio" | "camera" | "screen" | "screen-audio";

export type SimulcastLayer = "low" | "high";

// "ambient" is the hook for awareness without a decoded stream. The planner
// only emits "strong" for now.
export type ConnectionType = "strong" | "ambient";

export type PersonState = {
    id: string;
    // Key of the private room the person stands in, null outside every room.
    roomKey: string | null;
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
};

export type DesiredConsumer = CurrentConsumer & {
    connection: ConnectionType;
};

// What the magnitude rules see of one side of a pair.
export type RulePlayer = Pick<PersonState, "id" | "roomKey">;

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
    // The person each receiver has focused, who gets the high layer.
    focus?: ReadonlyMap<string, string>;
    config?: Partial<PlannerConfig>;
};

export type LayerChange = { producerId: string; layer: SimulcastLayer };

export type ReceiverPlan = {
    receiverId: string;
    desired: DesiredConsumer[];
    create: DesiredConsumer[];
    close: CurrentConsumer[];
    pause: string[];
    resume: string[];
    setLayer: LayerChange[];
    changed: boolean;
};

export type PlanResult = {
    // Sorted by receiver id.
    plans: ReceiverPlan[];
    // Receivers held back by the debounce, to keep in the dirty set.
    deferred: string[];
};
