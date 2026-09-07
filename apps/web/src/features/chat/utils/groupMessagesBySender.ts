import type { MessageWithDetails } from "@standin/contracts";
import { messageRenderKey } from "@/features/chat/utils/messageRenderKey";

export type MessageGroup = {
    key: string;
    senderId: string;
    messages: MessageWithDetails[];
};

// A group's key normally comes from its own leading message. But that
// message can stop being the leading one (an earlier message above it in
// the same group gets deleted) without the group itself being new, so
// reusing the previous group's key keeps it from remounting. Matched by
// messageRenderKey, not raw id, so it also covers a leading message that's
// a temp/peer message getting its id swapped for the real one.
//
// Built once per call as a flat Map instead of searching previousGroups per
// boundary message: the earlier per-message scan was quadratic in a
// conversation that never groups (every message from a different sender),
// a real shape for a two-person DM once enough history is loaded.
const previousGroupKeyByRenderKey = (
    previousGroups: MessageGroup[]
): Map<string, string> => {
    const map = new Map<string, string>();
    for (const group of previousGroups) {
        for (const message of group.messages) {
            map.set(messageRenderKey(message), group.key);
            // A message's tempId is only ever attached client-side, so a
            // plain refetch of the same message from the API returns it
            // without one. Indexing by the plain id too keeps the lookup
            // working once that tempId is gone.
            map.set(message.id, group.key);
        }
    }
    return map;
};

// A group whose messages are, in order, the exact same message references
// as one from the previous call is visually identical to it, so returning
// that same previous group object lets `React.memo(MessageGroup)` skip
// re-rendering it. Message references stay stable across a cache write
// that doesn't touch them, so this holds for every group unaffected by
// whatever just changed.
const reuseUnchangedGroups = (
    groups: MessageGroup[],
    previousGroups: MessageGroup[]
): MessageGroup[] => {
    const previousByKey = new Map(
        previousGroups.map((group) => [group.key, group])
    );

    return groups.map((group) => {
        const previous = previousByKey.get(group.key);
        const unchanged =
            previous !== undefined &&
            previous.senderId === group.senderId &&
            previous.messages.length === group.messages.length &&
            previous.messages.every(
                (message, index) => message === group.messages[index]
            );

        return unchanged ? previous : group;
    });
};

// Consecutive messages from the same sender are rendered as one visual
// group (single avatar/name, stacked bubbles) instead of repeating the
// header for every message, mirroring how Slack/Discord-style chats read.
export const groupMessagesBySender = (
    messages: MessageWithDetails[],
    previousGroups: MessageGroup[] = []
): MessageGroup[] => {
    const previousKeys = previousGroupKeyByRenderKey(previousGroups);
    // A previous group can lend its key to more than one new group at once
    // (e.g. it splits in two because a peer message arriving out of order
    // now sorts between two of its messages). Each key may only be claimed
    // once per call, so the second claimant falls back to its own
    // renderKey, which is already guaranteed unique.
    const usedKeys = new Set<string>();
    const groups: MessageGroup[] = [];

    for (const message of messages) {
        const lastGroup = groups.at(-1);
        if (lastGroup && lastGroup.senderId === message.senderId) {
            lastGroup.messages.push(message);
        } else {
            const renderKey = messageRenderKey(message);
            const inheritedKey = previousKeys.get(renderKey);
            const key =
                inheritedKey && !usedKeys.has(inheritedKey)
                    ? inheritedKey
                    : renderKey;
            usedKeys.add(key);
            groups.push({
                key,
                senderId: message.senderId,
                messages: [message],
            });
        }
    }

    return reuseUnchangedGroups(groups, previousGroups);
};
