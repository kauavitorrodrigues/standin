import type { MessageSender, MessageWithDetails } from "@standin/contracts";
import { UserAvatarInfo } from "@/features/users/components/UserAvatarInfo";
import { formatMessageTime } from "@/features/chat/utils/formatMessageTime";

type Props = {
    message: MessageWithDetails | undefined;
    sender: MessageSender | undefined;
};

// The message the thread hangs from, kept on top of the replies. It may be
// missing when it is older than what the main list has loaded, and the thread
// still works without it.
export const ReplyThreadParent = ({ message, sender }: Props) => {
    if (!message || !sender) return null;

    return (
        <div className="flex shrink-0 items-start gap-3 border-b px-2 pb-3">
            <UserAvatarInfo
                id={sender.id}
                name={sender.name}
                avatar={sender.profilePictureUrl}
                hideInfo
                size="sm"
                className="mt-0.5"
            />
            <div className="flex min-w-0 flex-1 flex-col">
                <div className="flex items-baseline gap-2">
                    <span className="text-sm font-semibold">{sender.name}</span>
                    <span className="text-xs text-muted-foreground">
                        {formatMessageTime(message.createdAt)}
                    </span>
                </div>
                <p className="line-clamp-6 text-sm wrap-break-word whitespace-pre-wrap">
                    {message.content}
                </p>
            </div>
        </div>
    );
};
