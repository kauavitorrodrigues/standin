import { formatDay } from "./date";

/** What the access column says: the day it ends, or that it has no end. */
export const describeAccessEnd = (expiresAt: string | null): string => {
    if (!expiresAt) return "Sem prazo";
    return formatDay(expiresAt);
};
