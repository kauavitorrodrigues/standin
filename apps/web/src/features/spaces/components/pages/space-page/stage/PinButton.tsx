import { PinIcon, PinOffIcon } from "lucide-react";

type PinButtonProps = {
    isPinned: boolean;
    onToggle: () => void;
};

export const PinButton = ({ isPinned, onToggle }: PinButtonProps) => {
    const Icon = isPinned ? PinOffIcon : PinIcon;

    return (
        <button
            type="button"
            aria-label={isPinned ? "Desafixar vídeo" : "Fixar vídeo"}
            title={isPinned ? "Desafixar" : "Fixar"}
            className="absolute top-1.5 left-1.5 flex size-6 items-center justify-center rounded-md bg-neutral-900/70 text-white opacity-0 backdrop-blur-md transition-opacity group-hover/tile:opacity-100 group-focus-within/tile:opacity-100 focus-visible:opacity-100"
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
