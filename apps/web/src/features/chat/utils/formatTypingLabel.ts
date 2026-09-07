// The "so-and-so is typing..." label shown above the composer, scaling down
// to a generic label once there are too many names to read comfortably.
export const formatTypingLabel = (names: string[]): string => {
    if (names.length === 1) return `${names[0]} está digitando...`;
    if (names.length === 2)
        return `${names[0]} e ${names[1]} estão digitando...`;
    return "Várias pessoas estão digitando...";
};
