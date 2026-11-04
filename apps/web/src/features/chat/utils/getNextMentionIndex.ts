// The row an arrow key moves to, wrapping at the ends. Any other key moves
// nothing (null).
export const getNextMentionIndex = (
    key: string,
    current: number,
    count: number
): number | null => {
    if (count === 0) return null;
    switch (key) {
        case "ArrowDown":
            return (current + 1) % count;
        case "ArrowUp":
            return (current - 1 + count) % count;
        default:
            return null;
    }
};
