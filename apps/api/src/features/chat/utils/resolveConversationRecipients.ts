import { ConversationService } from "@standin/core";
import { createTtlCache } from "@/lib/cache/createTtlCache";

const RECIPIENTS_TTL_MS = 10_000;
const RECIPIENTS_MAX_ENTRIES = 2_000;

const cache = createTtlCache<string[]>({
    ttlMs: RECIPIENTS_TTL_MS,
    maxEntries: RECIPIENTS_MAX_ENTRIES,
});

// The people who hear about what `actorId` does in a conversation, the actor
// left out. Null when the actor may not be in the conversation at all, so
// nothing is ever sent on behalf of someone with no access.
export const resolveConversationRecipients = async (
    conversationId: string,
    organizationId: string,
    actorId: string
): Promise<string[] | null> => {
    const conversation = await ConversationService.findById(
        conversationId,
        organizationId
    );
    const hasAccess = await ConversationService.canAccess(actorId, conversation);
    if (!hasAccess) return null;

    return ConversationService.getRecipientUserIds(conversation, actorId);
};

// The same answer, remembered for a few seconds. For what happens many times a
// second (typing), where reading the database on each one would be the cost of
// the feature. A person removed from the conversation stops hearing it within
// the ttl.
export const resolveCachedConversationRecipients = async (
    conversationId: string,
    organizationId: string,
    actorId: string
): Promise<string[] | null> => {
    const key = `${conversationId}:${actorId}`;
    const cached = cache.get(key);
    if (cached) return cached;

    const recipients = await resolveConversationRecipients(
        conversationId,
        organizationId,
        actorId
    );
    if (recipients) cache.set(key, recipients);
    return recipients;
};
