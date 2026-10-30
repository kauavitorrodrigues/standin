const FORMAT = new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "short",
    year: "2-digit",
    timeZone: "UTC",
});

/** A date a table can hold: "05 mar. 25". The day is the one in UTC. */
export const formatShortDate = (ms: number): string =>
    FORMAT.format(new Date(ms));
