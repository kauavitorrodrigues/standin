import { useState, type FormEvent } from "react";
import { format } from "date-fns";
import { CUSTOM_STATUS } from "@standin/contracts";
import { CheckIcon, XIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    CUSTOM_STATUS_DURATIONS,
    CUSTOM_STATUS_EMOJIS,
    DEFAULT_CUSTOM_STATUS_EMOJI,
} from "../../consts/availability";
import { USER_STATUS_MESSAGES } from "../../consts/messages";
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
        return USER_STATUS_MESSAGES.KEEP_DEADLINE(
            format(keptExpiresAt, "HH:mm")
        );
    }
    return USER_STATUS_MESSAGES.DURATIONS[duration];
};

/**
 * The line to say what the person is up to: an emoji, a short text and how
 * long it stays. It can be saved, changed and cleared at any time, and the
 * others see it next to the status.
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
        emoji: customStatus?.emoji ?? DEFAULT_CUSTOM_STATUS_EMOJI,
        duration: initialDuration(customStatus, now),
    }));
    // The schema has the last word when the draft is saved.
    const canSave = draft.text.trim().length > 0;

    const handleSubmit = (event: FormEvent) => {
        event.preventDefault();
        if (canSave) saveCustomStatus(draft);
    };

    const handleClear = () => {
        clearCustomStatus();
        setDraft((previous) => ({
            ...previous,
            text: "",
            duration: CUSTOM_STATUS_DURATIONS.NEVER,
        }));
    };

    return (
        <form className="flex flex-col gap-2 px-1" onSubmit={handleSubmit}>
            <div
                role="group"
                aria-label={USER_STATUS_MESSAGES.CUSTOM.EMOJI_LABEL}
                className="flex flex-wrap gap-1"
            >
                {CUSTOM_STATUS_EMOJIS.map((emoji) => (
                    <Button
                        key={emoji}
                        type="button"
                        variant="ghost"
                        size="icon-sm"
                        aria-pressed={draft.emoji === emoji}
                        className="aria-pressed:bg-foreground/10"
                        onClick={() =>
                            setDraft((previous) => ({ ...previous, emoji }))
                        }
                    >
                        {emoji}
                    </Button>
                ))}
            </div>
            <Input
                value={draft.text}
                maxLength={CUSTOM_STATUS.textMaxLength}
                placeholder={USER_STATUS_MESSAGES.CUSTOM.TEXT_PLACEHOLDER}
                aria-label={USER_STATUS_MESSAGES.CUSTOM.TEXT_LABEL}
                className="h-8"
                onChange={(event) =>
                    setDraft((previous) => ({
                        ...previous,
                        text: event.target.value,
                    }))
                }
            />
            <div className="flex items-center gap-1">
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
                        aria-label={USER_STATUS_MESSAGES.CUSTOM.DURATION_LABEL}
                    >
                        <SelectValue>
                            {(selected: CustomStatusDuration | null) =>
                                selected
                                    ? durationLabel(selected, keptExpiresAt)
                                    : ""
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
                <Button
                    type="submit"
                    variant="ghost"
                    size="icon-sm"
                    disabled={!canSave}
                    aria-label={USER_STATUS_MESSAGES.CUSTOM.SAVE}
                >
                    <CheckIcon />
                </Button>
                <Button
                    type="button"
                    variant="ghost"
                    size="icon-sm"
                    disabled={customStatus === null}
                    aria-label={USER_STATUS_MESSAGES.CUSTOM.CLEAR}
                    onClick={handleClear}
                >
                    <XIcon />
                </Button>
            </div>
        </form>
    );
};
