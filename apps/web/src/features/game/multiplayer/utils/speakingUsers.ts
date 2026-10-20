// Adds or removes a user from the set of the ones speaking. Gives back the
// same set when nothing changes, so a state update with it does not render.
export const toggleSpeakingUser = (
    previous: ReadonlySet<string>,
    userId: string,
    isSpeaking: boolean
): ReadonlySet<string> => {
    if (previous.has(userId) === isSpeaking) return previous;

    const next = new Set(previous);
    if (isSpeaking) next.add(userId);
    else next.delete(userId);
    return next;
};
