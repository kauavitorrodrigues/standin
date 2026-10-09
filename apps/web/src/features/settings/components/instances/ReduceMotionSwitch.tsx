import { Switch } from "@/components/ui/switch";
import { usePerformanceSettingsPreference } from "@/features/settings/performance/hooks/usePerformanceSettingsPreference";
import { performanceSettingsPreference } from "@/features/settings/performance/lib/performanceSettingsPreferences";

export const ReduceMotionSwitch = () => {
    const settings = usePerformanceSettingsPreference();

    return (
        <Switch
            aria-label="Reduzir animações"
            checked={settings.reduceMotion}
            onCheckedChange={(reduceMotion) =>
                performanceSettingsPreference.set({
                    ...settings,
                    reduceMotion,
                })
            }
        />
    );
};
