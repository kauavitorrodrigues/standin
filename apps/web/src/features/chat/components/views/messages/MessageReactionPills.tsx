import { AnimatePresence, motion } from "motion/react";
import type { MessageReactionSummary } from "@standin/contracts";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
    REACTION_PILL_ANIMATE,
    REACTION_PILL_EXIT,
    REACTION_PILL_INITIAL,
    REACTION_ROW_ANIMATE,
    REACTION_ROW_EXIT,
    REACTION_ROW_INITIAL,
    REACTION_ROW_KEY,
} from "@/features/chat/consts/messages";

type Props = {
    reactions: MessageReactionSummary[];
    disabled?: boolean;
    onToggle: (emoji: string, reactedByMe: boolean) => void;
};

// No `layout` prop, on either the row or a pill: `layout` tracks each
// element's on-screen position, which also shifts whenever the message
// scroller auto-scrolls for an unrelated new message, making this
// message's reactions appear to animate on every new message in the
// conversation. Same trade-off as MessageLine: pills snap into place
// instead of sliding.
export const MessageReactionPills = ({
    reactions,
    disabled = false,
    onToggle,
}: Props) => (
    <AnimatePresence initial={false}>
        {reactions.length > 0 && (
            <motion.div
                key={REACTION_ROW_KEY}
                initial={REACTION_ROW_INITIAL}
                animate={REACTION_ROW_ANIMATE}
                exit={REACTION_ROW_EXIT}
                className="flex flex-wrap items-center gap-1 overflow-hidden pt-1"
            >
                {reactions.map((reaction) => (
                    <motion.div
                        key={reaction.emoji}
                        initial={REACTION_PILL_INITIAL}
                        animate={REACTION_PILL_ANIMATE}
                        exit={REACTION_PILL_EXIT}
                    >
                        <Button
                            type="button"
                            disabled={disabled}
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
                    </motion.div>
                ))}
            </motion.div>
        )}
    </AnimatePresence>
);
