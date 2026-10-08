// First letter of a name, uppercased. Array.from keeps a character outside
// the basic plane (an emoji, for instance) in one piece.
export const getInitial = (name: string): string => {
    const [first] = Array.from(name.trim());
    return first ? first.toLocaleUpperCase() : "?";
};
