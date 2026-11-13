import { Switch } from "@/components/ui/switch";
import type { AmbientSettings } from "@/features/ambient/types";
import { useAmbientSettingsPreference } from "@/features/ambient/hooks/useAmbientSettingsPreference";
import { ambientSettingsPreference } from "@/features/ambient/lib/ambientSettingsPreferences";

type Props = {
    field: keyof AmbientSettings;
    ariaLabel: string;
};

// One option of the conversations nearby, saved as soon as it changes.
export const AmbientSettingSwitch = ({ field, ariaLabel }: Props) => {
    const settings = useAmbientSettingsPreference();

    return (
        <Switch
            aria-label={ariaLabel}
            checked={settings[field]}
            onCheckedChange={(checked) =>
                ambientSettingsPreference.set({
                    ...settings,
                    [field]: checked,
                })
            }
        />
    );
};
