import { Slider } from "@/components/ui/slider";
import { useOutputVolumePreference } from "@/features/media-devices/hooks/useOutputVolumePreference";
import { outputVolumePreference } from "@/features/media-devices/lib/audioSettingsPreferences";
import {
    OUTPUT_VOLUME_PERCENT,
    OUTPUT_VOLUME_SLIDER,
} from "../../consts/audioSettings";

export const OutputVolumeSlider = () => {
    const volume = useOutputVolumePreference();

    return (
        <div className="flex w-56 items-center gap-3">
            <Slider
                aria-label="Volume das outras pessoas"
                min={OUTPUT_VOLUME_SLIDER.min}
                max={OUTPUT_VOLUME_SLIDER.max}
                step={OUTPUT_VOLUME_SLIDER.step}
                value={Math.round(volume * OUTPUT_VOLUME_PERCENT)}
                onValueChange={(value) =>
                    outputVolumePreference.set(Number(value) / OUTPUT_VOLUME_PERCENT)
                }
            />
            <span className="w-10 shrink-0 text-right text-[13px] text-muted-foreground tabular-nums">
                {Math.round(volume * OUTPUT_VOLUME_PERCENT)}%
            </span>
        </div>
    );
};
