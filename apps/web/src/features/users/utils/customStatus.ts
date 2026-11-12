import { CUSTOM_STATUS, CustomStatusSchema } from "@standin/contracts";
import type { CustomStatus } from "@standin/contracts";
import {
    CUSTOM_STATUS_DURATION_MS,
    CUSTOM_STATUS_DURATIONS,
} from "../consts/availability";
import type {
    CustomStatusDraft,
    CustomStatusDuration,
} from "../types/availability";

const nextMidnight = (now: number): number => {
    const midnight = new Date(now);
    midnight.setHours(24, 0, 0, 0);
    return midnight.getTime();
};

/**
 * When a status picked now stops being shown, in ms since the epoch, or null
 * when it stays. Never past the longest status the server accepts, which a
 * day of 25 hours would otherwise go over. Keeping gives the current end back,
 * or none when there is no current end or it has passed.
 */
export const computeExpiresAt = (
    duration: CustomStatusDuration,
    now: number,
    currentExpiresAt: number | null = null
): number | null => {
    switch (duration) {
        case CUSTOM_STATUS_DURATIONS.KEEP:
            if (currentExpiresAt === null || currentExpiresAt <= now) {
                return null;
            }
            return currentExpiresAt;
        case CUSTOM_STATUS_DURATIONS.NEVER:
            return null;
        case CUSTOM_STATUS_DURATIONS.END_OF_DAY:
            return Math.min(
                nextMidnight(now),
                now + CUSTOM_STATUS.maxDurationMs
            );
        default:
            return now + CUSTOM_STATUS_DURATION_MS[duration];
    }
};

/**
 * The custom status for what the person typed, or null when it is not one the
 * server would take: no text, a text too long, or no emoji. The same schema
 * the server uses decides it.
 */
export const buildCustomStatus = (
    draft: CustomStatusDraft,
    now: number,
    currentExpiresAt: number | null = null
): CustomStatus | null => {
    const parsed = CustomStatusSchema.safeParse({
        text: draft.text,
        emoji: draft.emoji,
        expiresAt: computeExpiresAt(draft.duration, now, currentExpiresAt),
    });
    if (!parsed.success) return null;
    return parsed.data;
};

/**
 * Reads a custom status back from the device. Anything that is not a valid
 * status is dropped, and so is one whose time has passed.
 */
export const parseStoredCustomStatus = (
    stored: unknown
): CustomStatus | null => {
    const parsed = CustomStatusSchema.safeParse(stored);
    if (!parsed.success) return null;
    return parsed.data;
};

/**
 * The end of the current custom status when it can be kept: it has one and it
 * is still ahead. Otherwise null, and the field offers no "keep".
 */
export const keepableExpiresAt = (
    status: CustomStatus | null,
    now: number
): number | null => {
    const kept = keepUnlessExpired(status, now);
    return kept?.expiresAt ?? null;
};

/** What the duration control starts on: keep the end if there is one to keep. */
export const initialDuration = (
    status: CustomStatus | null,
    now: number
): CustomStatusDuration => {
    if (keepableExpiresAt(status, now) === null) {
        return CUSTOM_STATUS_DURATIONS.NEVER;
    }
    return CUSTOM_STATUS_DURATIONS.KEEP;
};

/** The custom status to show or send: null once it is past its end. */
export const keepUnlessExpired = (
    status: CustomStatus | null,
    now: number
): CustomStatus | null => {
    if (status === null || isCustomStatusExpired(status, now)) return null;
    return status;
};

/** Whether the custom status is past its end. */
export const isCustomStatusExpired = (
    status: CustomStatus,
    now: number
): boolean => status.expiresAt !== null && status.expiresAt <= now;
