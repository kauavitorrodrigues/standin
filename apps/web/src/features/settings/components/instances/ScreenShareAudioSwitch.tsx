import { Switch } from "@/components/ui/switch";
import { useScreenShareSettingsPreference } from "@/features/media-devices/hooks/useScreenShareSettingsPreference";
import { screenShareSettingsPreference } from "@/features/media-devices/lib/streamingSettingsPreferences";

export const ScreenShareAudioSwitch = () => {
    const settings = useScreenShareSettingsPreference();

    return (
        <Switch
            aria-label="Compartilhar o áudio da tela"
            checked={settings.shareAudio}
            onCheckedChange={(checked) =>
                screenShareSettingsPreference.set({
                    ...settings,
                    shareAudio: checked,
                })
            }
        />
    );
};
