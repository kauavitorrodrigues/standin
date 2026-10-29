import { Slider } from "@/components/ui/slider";
import { useNotificationSettingsPreference } from "@/features/notifications/hooks/useNotificationSettingsPreference";
import { playNotificationSoundNow } from "@/features/notifications/lib/playNotificationSound";
import { notificationSettingsPreference } from "@/features/notifications/lib/notificationSettingsPreferences";
import {
    OUTPUT_VOLUME_PERCENT,
    OUTPUT_VOLUME_SLIDER,
} from "../../consts/audioSettings";

export const NotificationVolumeSlider = () => {
    const settings = useNotificationSettingsPreference();
    const percent = Math.round(settings.volume * OUTPUT_VOLUME_PERCENT);

    return (
        <div className="flex w-56 items-center gap-3">
            <Slider
                aria-label="Volume dos sons de aviso"
                min={OUTPUT_VOLUME_SLIDER.min}
                max={OUTPUT_VOLUME_SLIDER.max}
                step={OUTPUT_VOLUME_SLIDER.step}
                value={percent}
                onValueChange={(value) =>
                    notificationSettingsPreference.set({
                        ...settings,
                        volume: Number(value) / OUTPUT_VOLUME_PERCENT,
                    })
                }
                // Lets the person hear the level they just picked.
                onValueCommitted={playNotificationSoundNow}
            />
            <span className="w-10 shrink-0 text-right text-[13px] text-muted-foreground tabular-nums">
                {percent}%
            </span>
        </div>
    );
};
