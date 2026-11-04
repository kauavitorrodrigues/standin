type Params = {
    // The area the avatar was in on the last frame, and the one it is in now.
    previousKey: string | null;
    currentKey: string | null;
    // Whether the avatar has walked around on its own by now.
    hasTraveled: boolean;
};

// Whether the avatar just walked into a common area. Standing where it spawned
// is no visit, so nothing counts before it has walked.
export const resolveAreaEntry = ({
    previousKey,
    currentKey,
    hasTraveled,
}: Params): boolean => {
    if (!hasTraveled) return false;
    if (currentKey === null) return false;
    return currentKey !== previousKey;
};
