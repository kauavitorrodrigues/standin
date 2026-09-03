import { useState } from "react";
import { PlusIcon, SmilePlusIcon } from "lucide-react";
import type { MessageReactionSummary } from "@standin/contracts";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import {
    EmojiPicker,
    EmojiPickerContent,
    EmojiPickerFooter,
    EmojiPickerSearch,
} from "@/components/ui/emoji-picker";
import { cn } from "@/lib/utils";
import { QUICK_REACTIONS } from "@/features/chat/consts/reactions";

type Props = {
    reactions: MessageReactionSummary[];
    onToggleReaction: (emoji: string, reactedByMe: boolean) => void;
};

// Opens on the fixed quick-react row. "Mais reações" swaps it for the full
// Frimousse picker (https://frimousse.liveblocks.io) so any emoji is reachable,
// not just the six defaults.
export const MessageReactionPicker = ({ reactions, onToggleReaction }: Props) => {
    const [open, setOpen] = useState(false);
    const [showAllEmojis, setShowAllEmojis] = useState(false);

    const reactedByMe = (emoji: string) =>
        reactions.find((reaction) => reaction.emoji === emoji)?.reactedByMe ??
        false;

    const select = (emoji: string) => {
        onToggleReaction(emoji, reactedByMe(emoji));
        setOpen(false);
    };

    return (
        <Popover
            open={open}
            onOpenChange={(next) => {
                setOpen(next);
                if (!next) setShowAllEmojis(false);
            }}
        >
            <PopoverTrigger
                render={
                    <button
                        type="button"
                        aria-label="Reagir"
                        className="flex size-6 items-center justify-center rounded text-muted-foreground hover:bg-muted hover:text-foreground"
                    />
                }
            >
                <SmilePlusIcon className="size-3.5" />
            </PopoverTrigger>
            <PopoverContent align="end" className="p-0">
                {showAllEmojis ? (
                    <EmojiPicker
                        className="h-80 w-64"
                        onEmojiSelect={({ emoji }) => select(emoji)}
                    >
                        <EmojiPickerSearch />
                        <EmojiPickerContent />
                        <EmojiPickerFooter />
                    </EmojiPicker>
                ) : (
                    <div className="flex items-center gap-0.5 p-1">
                        {QUICK_REACTIONS.map((emoji) => (
                            <button
                                key={emoji}
                                type="button"
                                onClick={() => select(emoji)}
                                className={cn(
                                    "rounded-md p-1 text-base transition-colors hover:bg-muted",
                                    reactedByMe(emoji) && "bg-primary/10"
                                )}
                            >
                                {emoji}
                            </button>
                        ))}
                        <button
                            type="button"
                            aria-label="Ver mais reações"
                            onClick={() => setShowAllEmojis(true)}
                            className="flex size-7 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                        >
                            <PlusIcon className="size-4" />
                        </button>
                    </div>
                )}
            </PopoverContent>
        </Popover>
    );
};
