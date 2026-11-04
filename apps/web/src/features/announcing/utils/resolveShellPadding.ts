// With a button the right edge hugs it, without one the text gets the same
// space it has on the left.
export const resolveShellPadding = (hasAction: boolean): string => {
    if (hasAction) return "pr-1";
    return "pr-3";
};
