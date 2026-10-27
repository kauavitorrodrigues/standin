import type { SfuClient } from "../lib/SfuClient";
import type { SfuEvents } from "./sfu";
import type { SfuSignal } from "./sfuSignal";

export type SfuSupervisorOptions = {
    signal: SfuSignal;
    events: Omit<SfuEvents, "onBroken">;
    createClient: (events: SfuEvents) => SfuClient;
    // Injected so the tests do not wait for real time.
    wait?: (ms: number) => Promise<void>;
};
