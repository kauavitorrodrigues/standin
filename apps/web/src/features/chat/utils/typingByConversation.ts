// conversationId -> userId -> userName. Keyed by userId so a repeated
// typing:true from the same user naturally dedupes instead of piling up.
export type TypingByConversation = Record<string, Record<string, string>>;

export const addTypingUser = (
    state: TypingByConversation,
    conversationId: string,
    userId: string,
    userName: string
): TypingByConversation => {
    const current = state[conversationId] ?? {};
    if (current[userId] === userName) return state;

    return {
        ...state,
        [conversationId]: { ...current, [userId]: userName },
    };
};

export const removeTypingUser = (
    state: TypingByConversation,
    conversationId: string,
    userId: string
): TypingByConversation => {
    const current = state[conversationId];
    if (!current || !(userId in current)) return state;

    const { [userId]: _removed, ...rest } = current;
    return { ...state, [conversationId]: rest };
};
