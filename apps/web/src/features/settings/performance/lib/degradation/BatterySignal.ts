import { BaseDegradationSignal } from "./BaseDegradationSignal";
import { DegradationSeverity } from "./DegradationSeverity";

export const BATTERY_LOW_LEVEL = 0.15;

interface BatteryManagerLike extends EventTarget {
    charging: boolean;
    level: number;
}

type NavigatorWithBattery = Navigator & {
    getBattery?: () => Promise<BatteryManagerLike>;
};

export const getBatterySeverity = (battery: { charging: boolean; level: number }) => {
    if (!battery.charging && battery.level <= BATTERY_LOW_LEVEL) return DegradationSeverity.Degraded;
    return DegradationSeverity.None;
};

export class BatterySignal extends BaseDegradationSignal {
    readonly id = "batteryLow";
    private battery: BatteryManagerLike | null = null;
    private generation = 0;

    private onChange = () => {
        if (!this.battery) return;
        this.setSeverity(getBatterySeverity(this.battery));
    };

    start() {
        if (typeof navigator === "undefined") return;
        const getBattery = (navigator as NavigatorWithBattery).getBattery;
        if (typeof getBattery !== "function") return;

        const generation = ++this.generation;
        getBattery
            .call(navigator)
            .then((battery) => {
                if (generation !== this.generation) return;
                this.battery = battery;
                battery.addEventListener("levelchange", this.onChange);
                battery.addEventListener("chargingchange", this.onChange);
                this.onChange();
            })
            .catch(() => {});
    }

    stop() {
        this.generation++;
        this.battery?.removeEventListener("levelchange", this.onChange);
        this.battery?.removeEventListener("chargingchange", this.onChange);
        this.battery = null;
        this.setSeverity(DegradationSeverity.None);
    }
}
