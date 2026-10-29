import { EyeIcon, EyeOffIcon } from "lucide-react";

type HideVideoButtonProps = {
    // Shows the video again instead of hiding it.
    isHidden: boolean;
    onToggle: () => void;
    // Where it sits when the pin button is in the corner too.
    afterPin?: boolean;
};

// Hides the video of a person for the viewer, who still hears them, or shows
// it again. It appears over the tile on hover, like the pin.
export const HideVideoButton = ({
    isHidden,
    onToggle,
    afterPin = false,
}: HideVideoButtonProps) => {
    const Icon = isHidden ? EyeIcon : EyeOffIcon;
    const label = isHidden ? "Mostrar vídeo" : "Ocultar vídeo";

    return (
        <button
            type="button"
            aria-label={label}
            title={label}
            className={`absolute top-1.5 ${afterPin ? "left-9" : "left-1.5"} flex size-6 items-center justify-center rounded-md bg-neutral-900/80 text-white transition-opacity focus-visible:opacity-100 ${isHidden ? "opacity-100" : "opacity-0 group-hover/tile:opacity-100 group-focus-within/tile:opacity-100"}`}
            onClick={(event) => {
                event.stopPropagation();
                onToggle();
            }}
            onKeyDown={(event) => event.stopPropagation()}
        >
            <Icon className="size-3.5" />
        </button>
    );
};
