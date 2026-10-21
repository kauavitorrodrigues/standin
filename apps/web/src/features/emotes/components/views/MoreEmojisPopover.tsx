import { useState } from "react";
import { PlusIcon } from "lucide-react";
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

type Props = {
    onSelect: (emoji: string) => void;
};

// The full picker, for any emoji that is not on the bar. Choosing one sends it
// and closes the picker, and the bar stays.
export const MoreEmojisPopover = ({ onSelect }: Props) => {
    const [open, setOpen] = useState(false);

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger
                render={
                    <button
                        type="button"
                        aria-label="Mais emojis"
                        className="flex size-7 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground aria-expanded:bg-muted"
                    />
                }
            >
                <PlusIcon className="size-3.5" />
            </PopoverTrigger>
            <PopoverContent side="top" sideOffset={8} className="p-0">
                <EmojiPicker
                    className="h-80 w-64"
                    onEmojiSelect={({ emoji }) => {
                        onSelect(emoji);
                        setOpen(false);
                    }}
                >
                    <EmojiPickerSearch />
                    <EmojiPickerContent />
                    <EmojiPickerFooter />
                </EmojiPicker>
            </PopoverContent>
        </Popover>
    );
};
