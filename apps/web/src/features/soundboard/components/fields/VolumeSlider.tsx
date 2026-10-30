import { Slider } from "@/components/ui/slider";
import { percentToVolume } from "../../utils/percentToVolume";
import { volumeToPercent } from "../../utils/volumeToPercent";

type Props = {
    volume: number;
    onChange: (volume: number) => void;
    disabled: boolean;
};

// The slider works in whole percent, the form holds a fraction.
export const VolumeSlider = ({ volume, onChange, disabled }: Props) => (
    <div className="flex items-center gap-3">
        <Slider
            aria-label="Volume do clipe"
            min={0}
            max={100}
            step={1}
            value={volumeToPercent(volume)}
            disabled={disabled}
            onValueChange={(value) => {
                const [first] = [value].flat();
                if (first !== undefined) onChange(percentToVolume(first));
            }}
        />
        <span className="w-10 text-right text-xs text-muted-foreground">
            {volumeToPercent(volume)}%
        </span>
    </div>
);
