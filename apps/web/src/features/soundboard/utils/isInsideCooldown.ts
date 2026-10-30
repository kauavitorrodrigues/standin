/**
 * Whether a click comes too soon after the last play. The server enforces the
 * wait; this skips such a click on this side, with no message, so the person
 * never sees the cooldown.
 */
export const isInsideCooldown = (
    lastPlayAt: number | null,
    now: number,
    cooldownMs: number
): boolean => lastPlayAt !== null && now - lastPlayAt < cooldownMs;
