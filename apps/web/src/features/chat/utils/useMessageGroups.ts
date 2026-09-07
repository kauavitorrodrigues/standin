import { useState } from "react";
import type { MessageWithDetails } from "@standin/contracts";
import {
    groupMessagesBySender,
    type MessageGroup,
} from "@/features/chat/utils/groupMessagesBySender";

type State = {
    messages: MessageWithDetails[];
    groups: MessageGroup[];
};

// Regrouping needs the previous render's groups to keep a group's key
// stable across a deletion or a temp/real id swap, so this can't be a plain
// useMemo: it has to read back what it produced last time. Tracked in
// state, adjusted during render (same pattern and reasoning as
// useMessageAnimationFlags), rather than a ref, since `messages` is a fresh
// array every render and a ref written mid-render isn't safe under
// concurrent rendering.
export const useMessageGroups = (
    messages: MessageWithDetails[]
): MessageGroup[] => {
    const [state, setState] = useState<State>(() => ({
        messages,
        groups: groupMessagesBySender(messages),
    }));

    if (state.messages !== messages) {
        const groups = groupMessagesBySender(messages, state.groups);
        setState({ messages, groups });
        return groups;
    }

    return state.groups;
};
