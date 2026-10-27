import { describe, expect, it } from "vitest";
import { createMemoryStore } from "@/lib/createMemoryStore";
import { type LocalPreference } from "@/lib/createLocalPreference";
import {
    DEFAULT_PERFORMANCE_SETTINGS,
    type PerformanceSettings,
} from "../../../consts/performanceSettings";
import {
    NO_PERFORMANCE_OVERRIDE,
    resolveEffectiveSettings,
    type PerformanceOverride,
} from "../../performanceOverride";
import {
    DegradationEffects,
    getDegradedSettings,
    type DegradationNotice,
} from "../DegradationEffects";
import {
    HARDWARE_DEGRADATION_WINDOW_MS,
    HardwareDegradationHistory,
} from "../hardwareDegradationHistory";

const setup = (user: PerformanceSettings = DEFAULT_PERFORMANCE_SETTINGS) => {
    const preferenceStore = createMemoryStore(user);
    const preference: LocalPreference<PerformanceSettings> = preferenceStore;
    const override = createMemoryStore<PerformanceOverride>(NO_PERFORMANCE_OVERRIDE);
    const notice = createMemoryStore<DegradationNotice | null>(null);
    let now = 0;
    const effects = new DegradationEffects({
        preference,
        override,
        notice,
        history: new HardwareDegradationHistory(),
        now: () => now,
    });
    const effective = () => resolveEffectiveSettings(preference.get(), override.get());
    return { effects, preference, override, notice, effective, setNow: (value: number) => (now = value) };
};

const cpu = { signalId: "webrtcCpuLimitation", hardwareLimited: true };
const battery = { signalId: "batteryLow", hardwareLimited: false };

describe("override layer", () => {
    it("degraded lowers the effective settings without touching the preference", () => {
        const { effects, preference, override, effective } = setup();
        effects.degrade(cpu);
        expect(effective()).toEqual({ fpsLimit: "30", reduceMotion: true });
        expect(preference.get()).toEqual(DEFAULT_PERFORMANCE_SETTINGS);
        expect(override.get().lowCameraBitrate).toBe(true);
        expect(override.get().hdScreenShareOff).toBe(true);
    });

    it("None restores the user's settings exactly", () => {
        const user: PerformanceSettings = { fpsLimit: "60", reduceMotion: false };
        const { effects, effective, override } = setup(user);
        effects.degrade(cpu);
        effects.recover();
        expect(effective()).toEqual(user);
        expect(override.get()).toBe(NO_PERFORMANCE_OVERRIDE);
    });

    it("lowers the frame rate and the motion", () => {
        expect(getDegradedSettings()).toEqual({ fpsLimit: "30", reduceMotion: true });
    });
});

describe("permanent promotion", () => {
    it("persists the lowered values on the second hardware degradation within 4 h", () => {
        const { effects, preference, notice, setNow } = setup();
        effects.degrade(cpu);
        effects.recover();
        expect(preference.get()).toEqual(DEFAULT_PERFORMANCE_SETTINGS);

        setNow(HARDWARE_DEGRADATION_WINDOW_MS - 1);
        effects.degrade(cpu);
        expect(preference.get()).toEqual({ fpsLimit: "30", reduceMotion: true });
        expect(notice.get()?.promoted).toBe(true);
        effects.recover();
        expect(preference.get().fpsLimit).toBe("30");
    });

    it("does not promote when the first start is older than 4 h", () => {
        const { effects, preference, setNow } = setup();
        effects.degrade(cpu);
        effects.recover();
        setNow(HARDWARE_DEGRADATION_WINDOW_MS);
        effects.degrade(cpu);
        expect(preference.get()).toEqual(DEFAULT_PERFORMANCE_SETTINGS);
    });

    it("battery degradations never count", () => {
        const { effects, preference } = setup();
        effects.degrade(battery);
        effects.recover();
        effects.degrade(battery);
        effects.recover();
        effects.degrade(cpu);
        expect(preference.get()).toEqual(DEFAULT_PERFORMANCE_SETTINGS);
    });
});

describe("banner", () => {
    it("shows per signal and dismissing keeps the override", () => {
        const { effects, notice, effective } = setup();
        effects.degrade(battery);
        expect(notice.get()).toEqual({ signalId: "batteryLow", promoted: false });
        effects.dismiss();
        expect(notice.get()).toBeNull();
        expect(effective().fpsLimit).toBe("30");
    });

    it("cancel reverts the override and is not reapplied in the same episode", () => {
        const { effects, effective, notice } = setup();
        effects.degrade(cpu);
        effects.cancel();
        expect(effective()).toEqual(DEFAULT_PERFORMANCE_SETTINGS);
        expect(notice.get()).toBeNull();
        effects.degrade(cpu);
        expect(effective()).toEqual(DEFAULT_PERFORMANCE_SETTINGS);
        effects.recover();
        effects.degrade(cpu);
        expect(effective().fpsLimit).toBe("30");
    });

    it("cancel on a promotion restores the previous preference", () => {
        const { effects, preference, setNow } = setup();
        effects.degrade(cpu);
        effects.recover();
        setNow(1000);
        effects.degrade(cpu);
        effects.cancel();
        expect(preference.get()).toEqual(DEFAULT_PERFORMANCE_SETTINGS);
    });
});
