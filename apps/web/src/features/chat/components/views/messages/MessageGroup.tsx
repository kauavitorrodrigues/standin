import { memo } from "react";
import { AnimatePresence, motion } from "motion/react";
import type { MessageSender, MessageWithDetails } from "@standin/contracts";
import { UserAvatarInfo } from "@/features/users/components/UserAvatarInfo";
import { MessageLine } from "@/features/chat/components/views/messages/MessageLine";
import { MessageLineContent } from "@/features/chat/components/views/messages/MessageLineContent";
import { formatMessageTime } from "@/features/chat/utils/formatMessageTime";
import { messageRenderKey } from "@/features/chat/utils/messageRenderKey";
import {
    MESSAGE_ORIGINAL_CONTENT_KEY,
    NEW_MESSAGE_ENTER_ANIMATE,
    NEW_MESSAGE_ENTER_INITIAL,
} from "@/features/chat/consts/messages";
import type { MessageGroup as MessageGroupType } from "@/features/chat/utils/groupMessagesBySender";

type Props = {
    group: MessageGroupType;
    sender: MessageSender;
    isOwn: boolean;
    isLastGroup: boolean;
    hasSingleViewer: boolean;
    newMessageIds: ReadonlySet<string>;
    editedMessageIds: ReadonlySet<string>;
    onToggleReaction: (
        messageId: string,
        emoji: string,
        reactedByMe: boolean
    ) => void;
    onRequestDelete: (message: MessageWithDetails) => void;
};

// Two nested motion elements, same idea as MessageLine: the outer one
// (avatar included) plays the entrance when this is a brand new group,
// while the inner one, keyed by editedAt, replays just that entrance for
// the message content alone when it's live-edited later.
//
// Wrapped in React.memo: groupMessagesBySender reuses the previous `group`
// object whenever its messages are unchanged, and MessageGroupList/
// useMessageAnimationFlags likewise keep `sender`/the id Sets referentially
// stable when nothing relevant changed, so a re-render here almost always
// means this group actually has something new to show.
const MessageGroupComponent = ({
    group,
    sender,
    isOwn,
    isLastGroup,
    hasSingleViewer,
    newMessageIds,
    editedMessageIds,
    onToggleReaction,
    onRequestDelete,
}: Props) => {
    const firstMessage = group.messages[0];
    const restMessages = group.messages.slice(1);
    // Only the group's actual last row can be the conversation's last
    // message: the leading message when there's no rest, otherwise the
    // last of the rest.
    const isFirstMessageLast = isLastGroup && restMessages.length === 0;

    return (
        <div className="flex flex-col gap-0.5">
            <motion.div
                initial={
                    !isOwn && newMessageIds.has(firstMessage.id)
                        ? NEW_MESSAGE_ENTER_INITIAL
                        : false
                }
                animate={NEW_MESSAGE_ENTER_ANIMATE}
                className="group/line flex items-start gap-3 rounded-md px-3 py-1 hover:bg-muted/20"
            >
                <UserAvatarInfo
                    id={sender.id}
                    name={sender.name}
                    avatar={sender.avatarUrl}
                    hideInfo
                    size="sm"
                    className="mt-0.5"
                />
                <div className="flex min-w-0 flex-1 flex-col">
                    <div className="flex items-baseline gap-2">
                        <span className="text-sm font-semibold text-foreground">
                            {sender.name}
                        </span>
                        <span className="text-xs text-muted-foreground">
                            {formatMessageTime(firstMessage.createdAt)}
                        </span>
                    </div>
                    <motion.div
                        key={
                            firstMessage.editedAt ??
                            MESSAGE_ORIGINAL_CONTENT_KEY
                        }
                        initial={
                            editedMessageIds.has(firstMessage.id)
                                ? NEW_MESSAGE_ENTER_INITIAL
                                : false
                        }
                        animate={NEW_MESSAGE_ENTER_ANIMATE}
                    >
                        <MessageLineContent
                            message={firstMessage}
                            isOwn={isOwn}
                            isLastMessage={isFirstMessageLast}
                            hasSingleViewer={hasSingleViewer}
                            onToggleReaction={(emoji, reactedByMe) =>
                                onToggleReaction(
                                    firstMessage.id,
                                    emoji,
                                    reactedByMe
                                )
                            }
                            onRequestDelete={onRequestDelete}
                        />
                    </motion.div>
                </div>
            </motion.div>
            <AnimatePresence initial={false}>
                {restMessages.map((message, index) => (
                    <MessageLine
                        key={messageRenderKey(message)}
                        message={message}
                        isOwn={isOwn}
                        hasSingleViewer={hasSingleViewer}
                        isNew={newMessageIds.has(message.id)}
                        isEdited={editedMessageIds.has(message.id)}
                        isLastMessage={
                            isLastGroup && index === restMessages.length - 1
                        }
                        onToggleReaction={(emoji, reactedByMe) =>
                            onToggleReaction(message.id, emoji, reactedByMe)
                        }
                        onRequestDelete={onRequestDelete}
                    />
                ))}
            </AnimatePresence>
        </div>
    );
};

export const MessageGroup = memo(MessageGroupComponent);
