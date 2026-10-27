/**
 * Keeps the order of a ranking steady while its members stay the same.
 *
 * The audio level observer reports the loud speakers sorted by volume, and the
 * volume of two people who talk together changes every report. Feeding that
 * order to the planner would swap who is heard and who is shown again and
 * again. Here the people who were already speaking keep their place, and only
 * a person who starts speaking is added (at the end), so the planner sees a
 * change only when somebody starts or stops.
 */
export const stabilizeRanking = (
    previous: readonly string[],
    next: readonly string[]
): string[] => {
    const speaking = new Set(next);
    const kept = previous.filter((id) => speaking.has(id));
    const known = new Set(kept);
    return [...kept, ...next.filter((id) => !known.has(id))];
};
