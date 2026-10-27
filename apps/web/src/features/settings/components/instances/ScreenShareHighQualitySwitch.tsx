import { Switch } from "@/components/ui/switch";
import { useScreenShareSettingsPreference } from "@/features/media-devices/hooks/useScreenShareSettingsPreference";
import { screenShareSettingsPreference } from "@/features/media-devices/lib/streamingSettingsPreferences";

export const ScreenShareHighQualitySwitch = () => {
    const settings = useScreenShareSettingsPreference();

    return (
        <Switch
            aria-label="Otimizar o compartilhamento para vídeo"
            checked={settings.highQuality}
            onCheckedChange={(checked) =>
                screenShareSettingsPreference.set({
                    ...settings,
                    highQuality: checked,
                })
            }
        />
    );
};
