import type { UserSummary } from "@standin/contracts";
import type { SuggestionExtensionsFactory } from "@/components/markdown/editor";

// A person the list offers, with whether they are in the space right now.
export type MentionCandidate = {
    user: UserSummary;
    isOnline: boolean;
};

export type MentionSuggestions = {
    suggestions: SuggestionExtensionsFactory;
    // Whether this conversation takes mentions at all.
    isMentionable: boolean;
};

export type MentionSource = {
    members: readonly UserSummary[];
    onlineUserIds: readonly string[];
    selfUserId: string;
};
