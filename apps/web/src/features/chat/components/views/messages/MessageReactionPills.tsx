import type { MessageReactionSummary } from "@standin/contracts";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

type Props = {
    reactions: MessageReactionSummary[];
    onToggle: (emoji: string, reactedByMe: boolean) => void;
};

// A message without reactions renders nothing here; the affordance to add
// the first one lives in the hover toolbar instead.
export const MessageReactionPills = ({ reactions, onToggle }: Props) => {
    if (reactions.length === 0) return null;
    return (
        <div className="flex flex-wrap items-center gap-1 pt-1">
            {reactions.map((reaction) => (
                <Button
                    key={reaction.emoji}
                    type="button"
                    onClick={() =>
                        onToggle(reaction.emoji, reaction.reactedByMe)
                    }
                    variant="ghost"
                    className={cn(
                        "flex items-center gap-1.5 rounded-md border-border h-7 px-2 text-xs transition-colors",
                        reaction.reactedByMe && "border-primary/20"
                    )}
                >
                    <span>{reaction.emoji}</span>
                    <span className="text-muted-foreground">
                        {reaction.count}
                    </span>
                </Button>
            ))}
        </div>
    );
};
