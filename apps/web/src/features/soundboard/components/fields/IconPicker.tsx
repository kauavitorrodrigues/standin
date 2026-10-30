import {
    EmojiPicker,
    EmojiPickerContent,
    EmojiPickerFooter,
    EmojiPickerSearch,
} from "@/components/ui/emoji-picker";
import { Button } from "@/components/ui/button";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { useIconPicker } from "../../hooks/useIconPicker";
import { IconClearButton } from "./IconClearButton";
import { IconPreview } from "./IconPreview";

type Props = {
    icon: string;
    onChange: (icon: string) => void;
    disabled: boolean;
};

// Picks the optional icon (an emoji for now) shown next to the name.
export const IconPicker = ({ icon, onChange, disabled }: Props) => {
    const picker = useIconPicker({ onChange });

    return (
        <div className="flex shrink-0 items-center">
            <Popover open={picker.open} onOpenChange={picker.setOpen}>
                <PopoverTrigger
                    render={
                        <Button
                            type="button"
                            variant="outline"
                            size="icon"
                            aria-label="Escolher ícone (emoji)"
                            disabled={disabled}
                        />
                    }
                >
                    <IconPreview icon={icon} />
                </PopoverTrigger>
                <PopoverContent side="top" sideOffset={8} className="p-0">
                    <IconClearButton
                        icon={icon}
                        disabled={disabled}
                        onClear={picker.clear}
                    />
                    <EmojiPicker
                        className="h-80 w-64"
                        onEmojiSelect={({ emoji }) => picker.pick(emoji)}
                    >
                        <EmojiPickerSearch />
                        <EmojiPickerContent />
                        <EmojiPickerFooter />
                    </EmojiPicker>
                </PopoverContent>
            </Popover>
        </div>
    );
};
