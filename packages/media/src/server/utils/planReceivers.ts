import type { ProximityPreset } from "@standin/contracts";
import { LOW_QUALITY_PLANNER_CONFIG } from "../../consts/spaceMedia";
import { planSubscriptions } from "../../planner/planSubscriptions";
import type {
    PlanInput,
    PositionSource,
    ReceiverPlan,
} from "../../planner/types";
import type { Peer } from "../spaceTypes";
import {
    buildCurrentConsumers,
    buildFocusMap,
    buildHiddenVideoMap,
    buildLastChangeAt,
    buildPeople,
    buildPinsMap,
} from "./buildPlannerInput";
import type { SplitReceivers } from "./splitReceivers";

export type PlannedReceivers = {
    plans: ReceiverPlan[];
    // Receivers held back by the debounce or still busy.
    deferred: string[];
    // The receivers planned with the low quality settings.
    lowIds: ReadonlySet<string>;
};

// Runs the planner for the ready receivers, the ones on a weak machine with
// their own settings, over the same snapshot of the room.
export const planReceivers = (
    now: number,
    positions: PositionSource,
    speakers: readonly string[],
    peers: ReadonlyMap<string, Peer>,
    split: SplitReceivers,
    preset: ProximityPreset,
    videoShed: number = 0
): PlannedReceivers => {
    const base: Omit<PlanInput, "dirtyIds" | "config"> = {
        now,
        positions,
        speakers,
        people: buildPeople(peers.values()),
        current: buildCurrentConsumers(peers.values()),
        lastChangeAt: buildLastChangeAt(peers.values()),
        focus: buildFocusMap(peers.values()),
        pins: buildPinsMap(peers.values()),
        hiddenVideo: buildHiddenVideoMap(peers.values()),
    };

    const planned: PlannedReceivers = {
        plans: [],
        deferred: [...split.busy],
        lowIds: split.low,
    };
    const run = (ids: Set<string>, config?: PlanInput["config"]) => {
        if (ids.size === 0) return;
        const result = planSubscriptions({ ...base, dirtyIds: ids, config });
        planned.plans.push(...result.plans);
        planned.deferred.push(...result.deferred);
    };

    run(split.normal, { preset, videoShed });
    run(split.low, { ...LOW_QUALITY_PLANNER_CONFIG, preset, videoShed });
    return planned;
};
