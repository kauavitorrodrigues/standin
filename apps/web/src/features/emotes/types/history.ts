export type EmoteUse = {
    // The emoji as it was sent last, with its skin tone.
    emoji: string;
    count: number;
    lastUsedAt: number;
};

export type EmoteHistory = {
    uses: EmoteUse[];
    // The emojis that were not on the bar when used, the newest first. This
    // is what the recent slots show, so using an emoji already on the bar
    // never moves the others.
    recentOrder: string[];
};

export type ReactionBarItems = {
    fixed: readonly string[];
    recents: readonly string[];
};
