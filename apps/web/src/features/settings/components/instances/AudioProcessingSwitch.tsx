import { Switch } from "@/components/ui/switch";
import { useAudioProcessingPreference } from "@/features/media-devices/hooks/useAudioProcessingPreference";
import { audioProcessingPreference } from "@/features/media-devices/lib/audioSettingsPreferences";
import type { AudioProcessingKey } from "@/features/media-devices/consts/audioSettings";

type Props = { processingKey: AudioProcessingKey; label: string };

export const AudioProcessingSwitch = ({ processingKey, label }: Props) => {
    const settings = useAudioProcessingPreference();

    return (
        <Switch
            aria-label={label}
            checked={settings[processingKey]}
            onCheckedChange={(checked) =>
                audioProcessingPreference.set({
                    ...settings,
                    [processingKey]: checked,
                })
            }
        />
    );
};
