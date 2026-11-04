import { useEffect, useMemo, useRef } from "react";
import { buildMentionLabel } from "@standin/contracts";
import {
    createSuggestionExtension,
    type SuggestionExtensionsFactory,
} from "@/components/markdown/editor";
import {
    MENTION_NODE_NAME,
    MENTION_TRIGGER,
} from "@/components/markdown/editor/consts/mention";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { OrganizationsQueries } from "@/features/organizations/queries";
import { useChatPage } from "@/features/chat/contexts/ChatPageContext";
import { MentionList } from "@/features/chat/components/views/mentions/MentionList";
import { buildMentionCandidates } from "@/features/chat/utils/buildMentionCandidates";
import type {
    MentionCandidate,
    MentionSuggestions,
} from "@/features/chat/types/mention";

// The mention list of the field, on only for the conversation of the space: a
// direct one does not take mentions. The conversation is known at once (it is
// the id of the space), and the extension is always installed and switched
// on and off, so the editor is never rebuilt while someone types. The people
// are read from a ref for the same reason.
export const useMentionSuggestions = (
    conversationId: string
): MentionSuggestions => {
    const { user } = useAuth();
    const { members } = OrganizationsQueries.useMembers();
    const { onlineUserIds, spaceConversationId } = useChatPage();

    const isMentionable = conversationId === spaceConversationId;

    const sourceRef = useRef({
        members,
        onlineUserIds,
        selfUserId: user.id,
        isMentionable,
    });
    useEffect(() => {
        sourceRef.current = {
            members,
            onlineUserIds,
            selfUserId: user.id,
            isMentionable,
        };
    });

    const suggestions: SuggestionExtensionsFactory = useMemo(
        () => (getContainer) => [
            createSuggestionExtension<MentionCandidate>({
                name: "mentionSuggestion",
                char: MENTION_TRIGGER,
                isEnabled: () => sourceRef.current.isMentionable,
                getItems: (query) =>
                    buildMentionCandidates({ ...sourceRef.current, query }),
                command: ({ editor, range, item }) => {
                    editor
                        .chain()
                        .focus()
                        .insertContentAt(range, [
                            {
                                type: MENTION_NODE_NAME,
                                attrs: {
                                    id: item.user.id,
                                    label: buildMentionLabel(item.user.name),
                                },
                            },
                            { type: "text", text: " " },
                        ])
                        .run();
                },
                List: MentionList,
                getContainer,
            }),
        ],
        []
    );

    return { suggestions, isMentionable };
};
