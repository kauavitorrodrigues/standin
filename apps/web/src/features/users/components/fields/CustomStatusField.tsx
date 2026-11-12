import { useRef, useState, type FormEvent } from "react";
import { format } from "date-fns";
import { CUSTOM_STATUS } from "@standin/contracts";
import { SmileIcon } from "lucide-react";
import { AnimatedCollapse } from "@/components/ui/animated-collapse";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import {
    EmojiPicker,
    EmojiPickerContent,
    EmojiPickerFooter,
    EmojiPickerSearch,
} from "@/components/ui/emoji-picker";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    CUSTOM_STATUS_DURATION_LABELS,
    CUSTOM_STATUS_DURATIONS,
} from "../../consts/availability";
import { useMinuteClock } from "../../hooks/useMinuteClock";
import { useUserStatus } from "../../hooks/useUserStatus";
import { initialDuration, keepableExpiresAt } from "../../utils/customStatus";
import type {
    CustomStatusDraft,
    CustomStatusDuration,
} from "../../types/availability";

const DURATION_VALUES = Object.values(CUSTOM_STATUS_DURATIONS);

const durationLabel = (
    duration: CustomStatusDuration,
    keptExpiresAt: number | null
): string => {
    if (duration === CUSTOM_STATUS_DURATIONS.KEEP && keptExpiresAt !== null) {
        return `Manter o prazo atual (até ${format(keptExpiresAt, "HH:mm")})`;
    }
    return CUSTOM_STATUS_DURATION_LABELS[duration];
};

const describeDuration = (
    duration: CustomStatusDuration | null,
    keptExpiresAt: number | null
): string => {
    if (!duration) return "";
    return durationLabel(duration, keptExpiresAt);
};

/**
 * The line to say what the person is up to. It rests as a row that looks
 * like a button and is the same input once opened, with an emoji picker inside.
 * Opening slides in how long it stays and the way to save or clear it. The others see it next to the status.
 */
export const CustomStatusField = () => {
    const { customStatus, saveCustomStatus, clearCustomStatus } =
        useUserStatus();
    const now = useMinuteClock().getTime();
    // The end the status has now, when there is one still ahead to keep.
    const keptExpiresAt = keepableExpiresAt(customStatus, now);
    const durations = DURATION_VALUES.filter(
        (duration) =>
            duration !== CUSTOM_STATUS_DURATIONS.KEEP || keptExpiresAt !== null
    );
    const [draft, setDraft] = useState<CustomStatusDraft>(() => ({
        text: customStatus?.text ?? "",
        emoji: customStatus?.emoji ?? "",
        duration: initialDuration(customStatus, now),
    }));
    const [isOpen, setIsOpen] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);
    const [isPickerOpen, setIsPickerOpen] = useState(false);

    // The row never changes size: it is the same input at rest and open, so
    // only the options below it animate. Opening starts from what is saved.
    const open = () => {
        if (isOpen) return;
        setDraft({
            text: customStatus?.text ?? "",
            emoji: customStatus?.emoji ?? "",
            duration: initialDuration(customStatus, now),
        });
        setIsOpen(true);
    };

    const close = () => {
        setIsOpen(false);
        setIsPickerOpen(false);
        inputRef.current?.blur();
    };

    // The schema has the last word when the draft is saved.
    const canSave = draft.text.trim().length > 0;

    const handleSubmit = (event: FormEvent) => {
        event.preventDefault();
        if (!canSave) return;
        if (saveCustomStatus(draft)) close();
    };

    const handleClear = () => {
        clearCustomStatus();
        close();
    };

    return (
        <form
            className="flex flex-col"
            onSubmit={handleSubmit}
            onKeyDown={(event) => {
                if (event.key === "Escape") close();
            }}
        >
            <div className="flex items-center">
                <div className="relative min-w-0 flex-1">
                    {isOpen ? (
                        <Popover
                            open={isPickerOpen}
                            onOpenChange={setIsPickerOpen}
                        >
                            <PopoverTrigger
                                render={
                                    <button
                                        type="button"
                                        aria-label={"Emoji do status"}
                                        className="absolute top-1/2 left-1.5 z-10 flex size-6 -translate-y-1/2 items-center justify-center rounded-md hover:bg-muted"
                                    />
                                }
                            >
                                {draft.emoji === "" ? (
                                    <SmileIcon
                                        className="size-4"
                                        strokeWidth={1.5}
                                    />
                                ) : (
                                    <span aria-hidden>{draft.emoji}</span>
                                )}
                            </PopoverTrigger>
                            <PopoverContent
                                side="top"
                                sideOffset={8}
                                className="p-0"
                            >
                                <EmojiPicker
                                    className="h-80 w-64"
                                    onEmojiSelect={({ emoji }) => {
                                        setDraft((previous) => ({
                                            ...previous,
                                            emoji,
                                        }));
                                        setIsPickerOpen(false);
                                    }}
                                >
                                    <EmojiPickerSearch />
                                    <EmojiPickerContent />
                                    <EmojiPickerFooter />
                                </EmojiPicker>
                            </PopoverContent>
                        </Popover>
                    ) : (
                        <span
                            aria-hidden
                            className="pointer-events-none absolute top-1/2 left-1.5 z-10 flex size-6 -translate-y-1/2 items-center justify-center text-muted-foreground"
                        >
                            {customStatus?.emoji ? (
                                customStatus.emoji
                            ) : (
                                <SmileIcon
                                    className="size-4"
                                    strokeWidth={1.5}
                                />
                            )}
                        </span>
                    )}
                    <Input
                        ref={inputRef}
                        readOnly={!isOpen}
                        value={isOpen ? draft.text : (customStatus?.text ?? "")}
                        maxLength={CUSTOM_STATUS.textMaxLength}
                        placeholder={"Atualizar seu status"}
                        aria-label={"Texto do status"}
                        className="h-8 cursor-pointer pl-9 read-only:cursor-pointer"
                        onClick={open}
                        onFocus={open}
                        onChange={(event) =>
                            setDraft((previous) => ({
                                ...previous,
                                text: event.target.value,
                            }))
                        }
                    />
                </div>
                <div
                    inert={!isOpen}
                    className={cn(
                        "shrink-0 overflow-hidden transition-[width,margin,opacity] duration-200 ease-out motion-reduce:transition-none",
                        isOpen ? "ml-2 w-40 opacity-100" : "ml-0 w-0 opacity-0"
                    )}
                >
                    <Select
                        value={draft.duration}
                        onValueChange={(next) => {
                            if (!next) return;
                            setDraft((previous) => ({
                                ...previous,
                                duration: next as CustomStatusDuration,
                            }));
                        }}
                    >
                        <SelectTrigger
                            aria-label={"Limpar status depois de"}
                            className="w-full"
                        >
                            <SelectValue>
                                {(selected: CustomStatusDuration | null) =>
                                    describeDuration(selected, keptExpiresAt)
                                }
                            </SelectValue>
                        </SelectTrigger>
                        <SelectContent>
                            {durations.map((duration) => (
                                <SelectItem key={duration} value={duration}>
                                    {durationLabel(duration, keptExpiresAt)}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            </div>
            <AnimatedCollapse open={isOpen}>
                <div className="flex flex-col gap-2 pt-2">
                    <div className="flex gap-2">
                        <Button
                            type="submit"
                            size="sm"
                            className="h-8 flex-1 rounded-lg"
                            disabled={!canSave}
                        >
                            Salvar status
                        </Button>
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            className="h-8 flex-1 rounded-lg"
                            onClick={close}
                        >
                            Cancelar
                        </Button>
                    </div>
                    {customStatus !== null && (
                        <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={handleClear}
                        >
                            Limpar status
                        </Button>
                    )}
                </div>
            </AnimatedCollapse>
        </form>
    );
};
