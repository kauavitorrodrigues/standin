import type { MessageSender } from "@standin/contracts";
import { UserAvatarInfo } from "@/features/users/components/UserAvatarInfo";
import { MessageLine } from "@/features/chat/components/views/messages/MessageLine";
import { MessageLineContent } from "@/features/chat/components/views/messages/MessageLineContent";
import { formatMessageTime } from "@/features/chat/utils/formatMessageTime";
import type { MessageGroup as MessageGroupType } from "@/features/chat/utils/groupMessagesBySender";

type Props = {
    group: MessageGroupType;
    sender: MessageSender;
    isOwn: boolean;
    onToggleReaction: (
        messageId: string,
        emoji: string,
        reactedByMe: boolean
    ) => void;
};

// The first message shares its hover background with the avatar and the
// name/time header, as one block. Every later message gets its own hover
// row instead (see MessageLine), matching Discord.
export const MessageGroup = ({
    group,
    sender,
    isOwn,
    onToggleReaction,
}: Props) => {
    const [firstMessage, ...restMessages] = group.messages;

    return (
        <div className="flex flex-col gap-0.5">
            <div className="group/line flex items-start gap-3 rounded-md px-3 py-1 hover:bg-muted/20">
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
                    <MessageLineContent
                        message={firstMessage}
                        isOwn={isOwn}
                        onToggleReaction={(emoji, reactedByMe) =>
                            onToggleReaction(
                                firstMessage.id,
                                emoji,
                                reactedByMe
                            )
                        }
                    />
                </div>
            </div>
            {restMessages.map((message) => (
                <MessageLine
                    key={message.id}
                    message={message}
                    isOwn={isOwn}
                    onToggleReaction={(emoji, reactedByMe) =>
                        onToggleReaction(message.id, emoji, reactedByMe)
                    }
                />
            ))}
        </div>
    );
};
