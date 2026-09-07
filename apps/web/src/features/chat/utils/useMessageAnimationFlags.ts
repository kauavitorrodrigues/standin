import { useState } from "react";

type MessageSnapshot = { id: string; editedAt: string | null };
type PreviousMessages = {
    editedAtById: Map<string, string | null>;
    lastId: string | null;
};

export type MessageAnimationFlags = {
    newMessageIds: ReadonlySet<string>;
    editedMessageIds: ReadonlySet<string>;
};

// Shared instead of allocating `new Set()` on every call, so most renders
// (which flag nothing) return the same reference and let
// React.memo(MessageGroup) skip re-rendering.
const EMPTY_ID_SET: ReadonlySet<string> = new Set();

type State = {
    // null only until the first render computes a real snapshot, distinct
    // from any real (even empty) `messages` array.
    messages: MessageSnapshot[] | null;
    flags: MessageAnimationFlags;
    previous: PreviousMessages | null;
};

const INITIAL_STATE: State = {
    messages: null,
    flags: { newMessageIds: EMPTY_ID_SET, editedMessageIds: EMPTY_ID_SET },
    previous: null,
};

// Flags messages that just changed, so their row can replay an entrance
// animation instead of the whole list re-animating on every fetch:
// newMessageIds is only what was appended after the previously known last
// message (so history/"load more" pages never get flagged), and
// editedMessageIds is only messages whose `editedAt` changed since the
// previous snapshot.
//
// Tracks the previous snapshot in state, adjusted during render, instead of
// a ref: `messages` is a freshly derived array every render, and
// reading/writing a ref mid-render isn't safe under concurrent rendering.
// Gated on `messages`'s identity rather than comparing a Map's size to
// `messages.length` (an earlier approach): that missed the case where one
// message was deleted and another added in the same render (same length),
// and it also broke once the previous last message itself got deleted,
// silently suppressing newMessageIds for every message after it.
export const useMessageAnimationFlags = (
    messages: MessageSnapshot[]
): MessageAnimationFlags => {
    const [state, setState] = useState<State>(INITIAL_STATE);

    if (state.messages === messages) {
        return state.flags;
    }

    const { previous } = state;
    const newMessageIds = new Set<string>();
    const editedMessageIds = new Set<string>();

    if (previous) {
        const lastIndex = previous.lastId
            ? messages.findIndex((message) => message.id === previous.lastId)
            : -1;
        // If the previous last message can't be found (e.g. it was just
        // deleted), there's no reliable boundary to slice from, so every
        // message gets checked; the `editedAtById.has` guard below still
        // keeps already-known messages from being flagged again.
        const tailMessages =
            lastIndex === -1 ? messages : messages.slice(lastIndex + 1);

        for (const message of tailMessages) {
            if (!previous.editedAtById.has(message.id)) {
                newMessageIds.add(message.id);
            }
        }

        for (const message of messages) {
            const previousEditedAt = previous.editedAtById.get(message.id);
            if (
                previousEditedAt !== undefined &&
                previousEditedAt !== message.editedAt
            ) {
                editedMessageIds.add(message.id);
            }
        }
    }

    const flags: MessageAnimationFlags = {
        newMessageIds: newMessageIds.size > 0 ? newMessageIds : EMPTY_ID_SET,
        editedMessageIds:
            editedMessageIds.size > 0 ? editedMessageIds : EMPTY_ID_SET,
    };

    setState({
        messages,
        flags,
        previous: {
            editedAtById: new Map(
                messages.map((message) => [message.id, message.editedAt])
            ),
            lastId: messages.at(-1)?.id ?? null,
        },
    });

    return flags;
};
