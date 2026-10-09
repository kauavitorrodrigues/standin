import type { ScreenShareSettings } from "@/features/media-devices/consts/streamingSettings";
import { useScreenShareSettingsPreference } from "@/features/media-devices/hooks/useScreenShareSettingsPreference";
import { screenShareSettingsPreference } from "@/features/media-devices/lib/streamingSettingsPreferences";
import { SettingSelect } from "./SettingSelect";

type Option<T extends string> = { value: T; label: string };

type Props<K extends keyof ScreenShareSettings> = {
    field: K;
    ariaLabel: string;
    options: Option<ScreenShareSettings[K]>[];
};

// One field of the screen share settings, saved as soon as it changes.
export const ScreenShareSettingsSelect = <K extends keyof ScreenShareSettings>({
    field,
    ariaLabel,
    options,
}: Props<K>) => {
    const settings = useScreenShareSettingsPreference();

    return (
        <SettingSelect
            ariaLabel={ariaLabel}
            options={options}
            value={settings[field]}
            onValueChange={(value) =>
                screenShareSettingsPreference.set({
                    ...settings,
                    [field]: value,
                })
            }
        />
    );
};
