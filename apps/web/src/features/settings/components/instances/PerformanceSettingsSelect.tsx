import type { PerformanceSettings } from "@/features/settings/performance/consts/performanceSettings";
import { usePerformanceSettingsPreference } from "@/features/settings/performance/hooks/usePerformanceSettingsPreference";
import { performanceSettingsPreference } from "@/features/settings/performance/lib/performanceSettingsPreferences";
import { SettingSelect } from "./SettingSelect";

type Option<T extends string> = { value: T; label: string };

type SelectField = {
    [K in keyof PerformanceSettings]: PerformanceSettings[K] extends string
        ? K
        : never;
}[keyof PerformanceSettings];

type Props<K extends SelectField> = {
    field: K;
    ariaLabel: string;
    options: Option<Extract<PerformanceSettings[K], string>>[];
};

// One field of the performance settings, saved as soon as it changes.
export const PerformanceSettingsSelect = <K extends SelectField>({
    field,
    ariaLabel,
    options,
}: Props<K>) => {
    const settings = usePerformanceSettingsPreference();

    return (
        <SettingSelect
            ariaLabel={ariaLabel}
            options={options}
            value={settings[field] as Extract<PerformanceSettings[K], string>}
            onValueChange={(value) =>
                performanceSettingsPreference.set({
                    ...settings,
                    [field]: value,
                })
            }
        />
    );
};
