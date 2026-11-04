type KeyLike = {
    key: string;
    shiftKey: boolean;
    isComposing: boolean;
};

// Enter sends and Shift+Enter breaks the line. While an IME composition is
// active (dead keys, Japanese, Chinese, Korean), Enter confirms the candidate.
export const shouldSubmit = ({
    key,
    shiftKey,
    isComposing,
}: KeyLike): boolean => {
    if (key !== "Enter") return false;
    if (shiftKey) return false;
    return !isComposing;
};
