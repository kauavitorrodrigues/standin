import { type PerformanceSettings } from "@/features/settings/performance/consts/performanceSettings";
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
    // The machine is back to normal. Shown once, with no way to cancel.
    recovered?: boolean;
};

export const degradationNoticeStore = createMemoryStore<DegradationNotice | null>(null);

// Degraded values, mapped onto standin's independent knobs: 30 fps and reduced
// motion.
export const getDegradedSettings = (): PerformanceSettings => ({
    fpsLimit: "30",
    reduceMotion: true,
});

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
    private degradedBy: string | null = null;
    // The user's preference before a permanent promotion, for Cancel.
    private previousPreference: PerformanceSettings | null = null;

    private readonly deps: Deps;

    constructor(deps: Deps) {
        this.deps = deps;
    }

    degrade({ signalId, hardwareLimited }: DegradationStart) {
        if (this.active || this.cancelled) return;
        this.active = true;
        this.degradedBy = signalId;

        const user = this.deps.preference.get();
        const lowered = getDegradedSettings();
        const promoted =
            hardwareLimited &&
            this.deps.history.record(this.deps.now()) >= HARDWARE_DEGRADATION_PROMOTE_COUNT;

        if (promoted) {
            this.previousPreference = user;
            this.deps.preference.set(lowered);
            this.deps.override.set({ settings: {}, lowCameraBitrate: true, hdScreenShareOff: true });
        } else {
            this.deps.override.set({ settings: lowered, lowCameraBitrate: true, hdScreenShareOff: true });
        }
        this.deps.notice.set({ signalId, promoted });
    }

    recover() {
        // Say so only when the user was still on the lowered settings, not
        // after Cancel, which already gave them back.
        const signalId = this.active ? this.degradedBy : null;
        this.active = false;
        this.cancelled = false;
        this.degradedBy = null;
        this.previousPreference = null;
        this.deps.override.set(NO_PERFORMANCE_OVERRIDE);
        this.deps.notice.set(
            signalId ? { signalId, promoted: false, recovered: true } : null
        );
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
