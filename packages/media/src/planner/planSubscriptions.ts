import { calculateProximityMagnitude } from "@standin/contracts";
import type { ProximityMagnitude } from "@standin/contracts";
import {
    AUDIO_ENTER_RADIUS,
    AUDIO_EXIT_RADIUS,
    CAROUSEL_SIZE,
    LOUDEST_SPEAKERS,
    MIN_CHANGE_INTERVAL_MS,
    PROXIMITY_PRESET,
    PX_PER_TILE,
    VIDEO_ENTER_RADIUS,
    VIDEO_EXIT_RADIUS,
    VIDEO_PAUSE_MAGNITUDE,
} from "../consts/planner";
import { DEFAULT_MAGNITUDE_RULES, applyMagnitudeRules } from "./magnitudeRules";
import type {
    CurrentConsumer,
    DesiredConsumer,
    PersonState,
    PlanInput,
    PlanResult,
    PlannerConfig,
    ProducerKind,
    ReceiverPlan,
    SimulcastLayer,
} from "./types";

export const DEFAULT_PLANNER_CONFIG: PlannerConfig = {
    loudestSpeakers: LOUDEST_SPEAKERS,
    carouselSize: CAROUSEL_SIZE,
    audioEnterRadius: AUDIO_ENTER_RADIUS,
    audioExitRadius: AUDIO_EXIT_RADIUS,
    videoEnterRadius: VIDEO_ENTER_RADIUS,
    videoExitRadius: VIDEO_EXIT_RADIUS,
    pxPerTile: PX_PER_TILE,
    preset: PROXIMITY_PRESET,
    videoPauseMagnitude: VIDEO_PAUSE_MAGNITUDE,
    minChangeIntervalMs: MIN_CHANGE_INTERVAL_MS,
    rules: DEFAULT_MAGNITUDE_RULES,
};

type Candidate = {
    person: PersonState;
    distance: number;
    mag: ProximityMagnitude;
    audioReachable: boolean;
    videoReachable: boolean;
};

type VideoEntry = {
    candidate: Candidate;
    source: "camera" | "screen";
    producerId: string;
    incumbent: boolean;
};

type Desired = {
    consumers: DesiredConsumer[];
    // People the receiver may still hear or see, used so a revocation is
    // never held back by the debounce.
    reachable: Set<string>;
};

const KIND_ORDER: Record<ProducerKind, number> = {
    audio: 0,
    camera: 1,
    screen: 2,
    "screen-audio": 3,
};

const VIDEO_KINDS: readonly ProducerKind[] = ["camera", "screen", "screen-audio"];

const compareText = (left: string, right: string): number => {
    if (left < right) return -1;
    if (left > right) return 1;
    return 0;
};

const layerFor = (
    source: "camera" | "screen",
    focused: boolean
): SimulcastLayer | null => {
    if (source === "screen") return null;
    return focused ? "high" : "low";
};

const distanceBetween = (
    from: { x: number; y: number },
    to: { x: number; y: number }
): number => Math.hypot(from.x - to.x, from.y - to.y);

// Reach with hysteresis: a person already consumed is kept until the exit
// radius, a new one is only taken inside the enter radius.
const isWithinReach = (
    distance: number,
    held: boolean,
    enterRadius: number,
    exitRadius: number
): boolean => distance <= (held ? exitRadius : enterRadius);

const toDesired = (
    personId: string,
    producerId: string,
    kind: ProducerKind,
    layer: SimulcastLayer | null,
    paused: boolean
): DesiredConsumer => ({
    personId,
    producerId,
    kind,
    layer,
    paused,
    connection: "strong",
});

const buildDesired = (
    receiver: PersonState,
    input: PlanInput,
    config: PlannerConfig,
    held: readonly CurrentConsumer[]
): Desired => {
    const receiverSpot = input.positions.get(receiver.id);
    const reachable = new Set<string>();
    if (!receiverSpot) return { consumers: [], reachable };

    const heldKinds = new Map<string, Set<ProducerKind>>();
    held.forEach((consumer) => {
        const kinds = heldKinds.get(consumer.personId) ?? new Set();
        kinds.add(consumer.kind);
        heldKinds.set(consumer.personId, kinds);
    });
    const speakerRank = new Map(input.speakers.map((id, index) => [id, index]));
    const rankOf = (id: string) => speakerRank.get(id) ?? Number.POSITIVE_INFINITY;

    const candidates: Candidate[] = [];
    input.people.forEach((person) => {
        if (person.id === receiver.id) return;
        const spot = input.positions.get(person.id);
        if (!spot) return;

        const distance = distanceBetween(receiverSpot, spot);
        const base = calculateProximityMagnitude(
            config.preset,
            distance / config.pxPerTile
        );
        const mag = applyMagnitudeRules(config.rules, receiver, person, base);
        const kinds = heldKinds.get(person.id);
        const holdsAudio = kinds?.has("audio") ?? false;
        const holdsVideo = VIDEO_KINDS.some((kind) => kinds?.has(kind));

        const audioReachable =
            mag.audio > 0 &&
            isWithinReach(
                distance,
                holdsAudio,
                config.audioEnterRadius,
                config.audioExitRadius
            );
        const videoReachable =
            mag.video > 0 &&
            isWithinReach(
                distance,
                holdsVideo,
                config.videoEnterRadius,
                config.videoExitRadius
            );

        if (audioReachable || videoReachable) reachable.add(person.id);
        candidates.push({ person, distance, mag, audioReachable, videoReachable });
    });

    const consumers: DesiredConsumer[] = [];

    // Audio: the loudest speakers first, then the nearest to fill the rest.
    // When nobody speaks this is simply the K nearest.
    candidates
        .filter(
            (candidate) =>
                candidate.audioReachable && candidate.person.producers.audio
        )
        .sort(
            (a, b) =>
                rankOf(a.person.id) - rankOf(b.person.id) ||
                a.distance - b.distance ||
                compareText(a.person.id, b.person.id)
        )
        .slice(0, config.loudestSpeakers)
        .forEach(({ person }) => {
            consumers.push(
                toDesired(person.id, person.producers.audio!, "audio", null, false)
            );
        });

    // Video: screens take the slots first, a camera and a screen of the same
    // person are separate entries, incumbents win ties against newcomers.
    const entries: VideoEntry[] = [];
    candidates
        .filter((candidate) => candidate.videoReachable)
        .forEach((candidate) => {
            const kinds = heldKinds.get(candidate.person.id);
            (["camera", "screen"] as const).forEach((source) => {
                const producerId = candidate.person.producers[source];
                if (!producerId) return;
                entries.push({
                    candidate,
                    source,
                    producerId,
                    incumbent: kinds?.has(source) ?? false,
                });
            });
        });

    const sourcePriority = (entry: VideoEntry) =>
        entry.source === "screen" ? 0 : 1;
    const speakingRank = (entry: VideoEntry) =>
        entry.source === "camera" ? rankOf(entry.candidate.person.id) : 0;

    entries
        .sort(
            (a, b) =>
                sourcePriority(a) - sourcePriority(b) ||
                speakingRank(a) - speakingRank(b) ||
                Number(b.incumbent) - Number(a.incumbent) ||
                a.candidate.distance - b.candidate.distance ||
                compareText(a.candidate.person.id, b.candidate.person.id)
        )
        .slice(0, config.carouselSize)
        .forEach((entry) => {
            const { person, mag } = entry.candidate;
            const focused = input.focus?.get(receiver.id) === person.id;
            const layer = layerFor(entry.source, focused);
            const paused = mag.video <= config.videoPauseMagnitude;
            consumers.push(
                toDesired(person.id, entry.producerId, entry.source, layer, paused)
            );

            const screenAudio = person.producers["screen-audio"];
            if (entry.source === "screen" && screenAudio && mag.audio > 0) {
                consumers.push(
                    toDesired(person.id, screenAudio, "screen-audio", null, false)
                );
            }
        });

    consumers.sort(
        (a, b) =>
            KIND_ORDER[a.kind] - KIND_ORDER[b.kind] ||
            compareText(a.personId, b.personId)
    );
    return { consumers, reachable };
};

const diffConsumers = (
    receiverId: string,
    desired: DesiredConsumer[],
    held: readonly CurrentConsumer[]
): ReceiverPlan => {
    const heldById = new Map(held.map((consumer) => [consumer.producerId, consumer]));
    const desiredIds = new Set(desired.map((consumer) => consumer.producerId));

    const plan: ReceiverPlan = {
        receiverId,
        desired,
        create: [],
        close: held.filter((consumer) => !desiredIds.has(consumer.producerId)),
        pause: [],
        resume: [],
        setLayer: [],
        changed: false,
    };

    desired.forEach((want) => {
        const have = heldById.get(want.producerId);
        if (!have) {
            plan.create.push(want);
            return;
        }
        if (want.paused && !have.paused) plan.pause.push(want.producerId);
        if (!want.paused && have.paused) plan.resume.push(want.producerId);
        if (want.layer && want.layer !== have.layer) {
            plan.setLayer.push({ producerId: want.producerId, layer: want.layer });
        }
    });

    plan.changed =
        plan.create.length > 0 ||
        plan.close.length > 0 ||
        plan.pause.length > 0 ||
        plan.resume.length > 0 ||
        plan.setLayer.length > 0;
    return plan;
};

// Pure planner, decision D4: the server decides who each person consumes and
// the client never chooses. Runs only for the receivers in `dirtyIds`, and
// for the same input always returns the same plans.
export const planSubscriptions = (input: PlanInput): PlanResult => {
    const config: PlannerConfig = { ...DEFAULT_PLANNER_CONFIG, ...input.config };
    const peopleById = new Map(input.people.map((person) => [person.id, person]));
    const receivers = [...input.dirtyIds]
        .filter((id) => peopleById.has(id))
        .sort(compareText);

    const plans: ReceiverPlan[] = [];
    const deferred: string[] = [];

    receivers.forEach((receiverId) => {
        const held = input.current.get(receiverId) ?? [];
        const { consumers, reachable } = buildDesired(
            peopleById.get(receiverId)!,
            input,
            config,
            held
        );
        const full = diffConsumers(receiverId, consumers, held);

        const last = input.lastChangeAt.get(receiverId);
        const debounced =
            last !== undefined && input.now - last < config.minChangeIntervalMs;
        if (!debounced) {
            plans.push(full);
            return;
        }

        // Inside the window only revocations of people who are no longer
        // reachable go through, so privacy never waits for the debounce.
        if (full.changed) deferred.push(receiverId);
        const revoked = full.close.filter(
            (consumer) => !reachable.has(consumer.personId)
        );
        plans.push({
            receiverId,
            desired: consumers,
            create: [],
            close: revoked,
            pause: [],
            resume: [],
            setLayer: [],
            changed: revoked.length > 0,
        });
    });

    return { plans, deferred };
};
