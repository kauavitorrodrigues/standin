import { format, parseISO } from "date-fns";

// "2026-11-30" as "30/11/2026".
export const formatExpiryDay = (day: string): string =>
    format(parseISO(day), "dd/MM/yyyy");
