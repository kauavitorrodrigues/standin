import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from "@/components/ui/tooltip";

type Props = {
    emoji: string;
    // The key that sends it, shown in the tooltip.
    shortcut: string;
    onSelect: (emoji: string) => void;
};

export const ReactionBarItem = ({ emoji, shortcut, onSelect }: Props) => (
    <Tooltip>
        <TooltipTrigger
            render={
                <button
                    type="button"
                    aria-label={`Reagir com ${emoji}`}
                    onClick={() => onSelect(emoji)}
                    className="flex size-7 min-w-0 items-center justify-center rounded-md text-base transition-transform hover:bg-muted active:scale-90"
                />
            }
        >
            {emoji}
        </TooltipTrigger>
        <TooltipContent shortcut={shortcut}>{emoji}</TooltipContent>
    </Tooltip>
);
