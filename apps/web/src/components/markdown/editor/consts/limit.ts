// What fits when `incoming` replaces `selected` characters of a text that
// already has `current` characters: a textarea cuts a paste at the limit.
export const clipToLimit = (
    incoming: string,
    current: number,
    selected: number,
    max: number
): string => {
    const room = Math.max(0, max - (current - selected));
    return incoming.slice(0, room);
};
