import { DAY_MS } from "./consts/time";

/** The moment `days` days after `from`, now by default. */
export const daysFromNow = (days: number, from: Date = new Date()): Date =>
    new Date(from.getTime() + days * DAY_MS);
