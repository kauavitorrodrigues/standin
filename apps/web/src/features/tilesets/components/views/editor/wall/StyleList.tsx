import type { WallStyle } from "@standin/contracts";

type Props = {
    styles: WallStyle[];
    active: string;
    disabled: boolean;
    onPick: (name: string) => void;
};

// The styles the tileset already has, to put the selected wall in one of them
// with a click instead of typing its name again.
export const WallStyleList = ({ styles, active, disabled, onPick }: Props) => (
    <div className="flex flex-wrap gap-1.5">
        {styles.map((style) => (
            <button
                key={style.name}
                type="button"
                disabled={disabled}
                aria-pressed={style.name === active}
                onClick={() => onPick(style.name)}
                className="border-border bg-background hover:bg-muted aria-pressed:border-primary aria-pressed:bg-primary/10 aria-pressed:text-primary rounded-full border px-2.5 py-1 text-xs transition-colors disabled:pointer-events-none disabled:opacity-50"
            >
                {style.name}
            </button>
        ))}
    </div>
);
