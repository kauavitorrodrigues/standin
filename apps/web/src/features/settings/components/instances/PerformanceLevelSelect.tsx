import {
    BatteryLowIcon,
    GaugeIcon,
    ScaleIcon,
    SlidersHorizontalIcon,
    ZapIcon,
    type LucideIcon,
} from "lucide-react";
import {
    CUSTOM_PERFORMANCE_LEVEL,
    type PerformanceLevelChoice,
} from "@/features/settings/performance/consts/performanceLevels";
import { useTeleportWhenBlockedPreference } from "@/features/game/hooks/useTeleportWhenBlockedPreference";
import { teleportWhenBlockedPreference } from "@/features/game/lib/teleportWhenBlockedPreference";
import { usePerformanceSettingsPreference } from "@/features/settings/performance/hooks/usePerformanceSettingsPreference";
import {
    getLevelSettings,
    getLevelTeleport,
    getPerformanceLevel,
} from "@/features/settings/performance/lib/performanceLevels";
import { performanceSettingsPreference } from "@/features/settings/performance/lib/performanceSettingsPreferences";
import { SettingSelect } from "./SettingSelect";

const LEVEL_OPTIONS: {
    value: PerformanceLevelChoice;
    label: string;
    icon: LucideIcon;
}[] = [
    { value: "best", label: "Melhor", icon: ZapIcon },
    { value: "balanced", label: "Equilibrado", icon: ScaleIcon },
    { value: "low", label: "Baixo", icon: GaugeIcon },
    { value: "powerSaver", label: "Economia de energia", icon: BatteryLowIcon },
];

const CUSTOM_OPTION = {
    value: CUSTOM_PERFORMANCE_LEVEL,
    label: "Personalizado",
    icon: SlidersHorizontalIcon,
} as const;

// Picking a level writes all of its knobs at once. "Personalizado" only shows
// while the knobs match no level, and cannot be picked.
export const PerformanceLevelSelect = () => {
    const settings = usePerformanceSettingsPreference();
    const teleportWhenBlocked = useTeleportWhenBlockedPreference();
    const level = getPerformanceLevel(settings, teleportWhenBlocked);
    const options =
        level === CUSTOM_PERFORMANCE_LEVEL
            ? [...LEVEL_OPTIONS, CUSTOM_OPTION]
            : LEVEL_OPTIONS;

    return (
        <SettingSelect
            ariaLabel="Nível de desempenho"
            options={options}
            value={level}
            onValueChange={(next) => {
                if (next === CUSTOM_PERFORMANCE_LEVEL) return;
                performanceSettingsPreference.set(getLevelSettings(next));
                teleportWhenBlockedPreference.set(getLevelTeleport(next));
            }}
        />
    );
};
