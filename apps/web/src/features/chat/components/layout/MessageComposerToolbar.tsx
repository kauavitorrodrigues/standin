import type { RefObject } from "react";
import { AtSignIcon, PaperclipIcon, SmileIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FileUploadTrigger } from "@/components/ui/file-upload";
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
    onInsertEmoji: (emoji: string) => void;
    composerFrameRef: RefObject<HTMLDivElement | null>;
};

// Mentions are not implemented yet, so that one stays a visible, disabled
// placeholder. The attachment trigger relies on being rendered inside the
// composer's FileUpload root (see SendMessageForm) to reach the shared
// file-picker context. Emoji insertion reuses the same Popover + EmojiPicker
// used for message reactions (see MessageReactionPicker), but is anchored to
// the whole composer frame (not just this button) and opens above it, so it
// never covers the field the user is typing in.
export const MessageComposerToolbar = ({
    onInsertEmoji,
    composerFrameRef,
}: Props) => (
    <div className="flex items-center gap-1">
        <FileUploadTrigger
            render={
                <Button
                    type="button"
                    variant="ghost"
                    size="icon-sm"
                    aria-label="Anexar arquivo"
                />
            }
        >
            <PaperclipIcon />
        </FileUploadTrigger>
        <Popover>
            <PopoverTrigger
                render={
                    <Button
                        type="button"
                        variant="ghost"
                        size="icon-sm"
                        aria-label="Inserir emoji"
                    />
                }
            >
                <SmileIcon />
            </PopoverTrigger>
            <PopoverContent
                anchor={composerFrameRef}
                side="top"
                align="start"
                sideOffset={8}
                className="p-0"
            >
                <EmojiPicker
                    className="h-80 w-64"
                    onEmojiSelect={({ emoji }) => onInsertEmoji(emoji)}
                >
                    <EmojiPickerSearch />
                    <EmojiPickerContent />
                    <EmojiPickerFooter />
                </EmojiPicker>
            </PopoverContent>
        </Popover>
        <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            aria-label="Mencionar alguém"
            disabled
        >
            <AtSignIcon />
        </Button>
    </div>
);
