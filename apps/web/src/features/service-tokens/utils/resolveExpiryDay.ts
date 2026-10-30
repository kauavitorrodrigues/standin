import { addDays, format } from "date-fns";
import { SERVICE_TOKEN_EXPIRY_OPTIONS } from "../consts/expiryOptions";
import type { ExpiryOptionId } from "../types";

// The day ("2026-12-31") the chosen option makes the token expire, "" for a
// custom option still without a date, or null when the token does not expire.
export const resolveExpiryDay = (
    id: ExpiryOptionId,
    customDay: string,
    now: Date = new Date()
): string | null => {
    if (id === "custom") return customDay;
    const option = SERVICE_TOKEN_EXPIRY_OPTIONS.find((item) => item.id === id);
    if (!option || option.days === null) return null;
    return format(addDays(now, option.days), "yyyy-MM-dd");
};
