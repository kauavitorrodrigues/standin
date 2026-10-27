import {
    type PerformanceSettings,
    type VideoPeerLimit,
} from "@/features/settings/performance/consts/performanceSettings";
import { createMemoryStore, type MemoryStore } from "@/lib/createMemoryStore";
import { type LocalPreference } from "@/lib/createLocalPreference";
import {
    HARDWARE_DEGRADATION_PROMOTE_COUNT,
    HardwareDegradationHistory,
} from "./hardwareDegradationHistory";
import {
    NO_PERFORMANCE_OVERRIDE,
    performanceOverrideStore,
    type PerformanceOverride,
} from "@/features/settings/performance/lib/performanceOverride";
import { performanceSettingsPreference } from "@/features/settings/performance/lib/performanceSettingsPreferences";

export type DegradationNotice = {
    signalId: string;
    // The lowered values were written to the user's preference.
    promoted: boolean;
};

export const degradationNoticeStore = createMemoryStore<DegradationNotice | null>(null);

// Degraded values, mapped onto standin's independent knobs: 30 fps, at most 2
// video peers (never raising a lower user choice) and reduced motion.
export const getDegradedSettings = (user: PerformanceSettings): PerformanceSettings => {
    const maxVideoPeers: VideoPeerLimit = Number(user.maxVideoPeers) < 2 ? user.maxVideoPeers : "2";
    return { fpsLimit: "30", maxVideoPeers, reduceMotion: true };
};

type Deps = {
    preference: LocalPreference<PerformanceSettings>;
    override: MemoryStore<PerformanceOverride>;
    notice: MemoryStore<DegradationNotice | null>;
    history: HardwareDegradationHistory;
    now: () => number;
};

export type DegradationStart = { signalId: string; hardwareLimited: boolean };

export class DegradationEffects {
    private active = false;
    // Set when the user cancelled, so the same episode is not applied again.
    private cancelled = false;
    // The user's preference before a permanent promotion, for Cancel.
    private previousPreference: PerformanceSettings | null = null;

    private readonly deps: Deps;

    constructor(deps: Deps) {
        this.deps = deps;
    }

    degrade({ signalId, hardwareLimited }: DegradationStart) {
        if (this.active || this.cancelled) return;
        this.active = true;

        const user = this.deps.preference.get();
        const lowered = getDegradedSettings(user);
        const promoted =
            hardwareLimited &&
            this.deps.history.record(this.deps.now()) >= HARDWARE_DEGRADATION_PROMOTE_COUNT;

        if (promoted) {
            this.previousPreference = user;
            this.deps.preference.set(lowered);
            this.deps.override.set({ settings: {}, lowCameraBitrate: true });
        } else {
            this.deps.override.set({ settings: lowered, lowCameraBitrate: true });
        }
        this.deps.notice.set({ signalId, promoted });
    }

    recover() {
        this.active = false;
        this.cancelled = false;
        this.previousPreference = null;
        this.deps.override.set(NO_PERFORMANCE_OVERRIDE);
        this.deps.notice.set(null);
    }

    cancel() {
        if (!this.active) return;
        this.active = false;
        this.cancelled = true;
        if (this.previousPreference) this.deps.preference.set(this.previousPreference);
        this.previousPreference = null;
        this.deps.override.set(NO_PERFORMANCE_OVERRIDE);
        this.deps.notice.set(null);
    }

    dismiss() {
        this.deps.notice.set(null);
    }
}

export const degradationEffects = new DegradationEffects({
    preference: performanceSettingsPreference,
    override: performanceOverrideStore,
    notice: degradationNoticeStore,
    history: new HardwareDegradationHistory(),
    now: Date.now,
});
