import { useState } from "react";
import type { MessageWithDetails } from "@standin/contracts";
import { MessageReactionPills } from "@/features/chat/components/views/messages/MessageReactionPills";
import { MessageAttachments } from "@/features/chat/components/views/messages/MessageAttachments";
import { MessageSeenByLabel } from "@/features/chat/components/views/messages/MessageSeenByLabel";
import { MessageLineToolbar } from "@/features/chat/components/views/messages/MessageLineToolbar";
import { MessageEditedTag } from "@/features/chat/components/views/messages/MessageEditedTag";
import { EditMessageForm } from "@/features/chat/components/forms/EditMessageForm";
import { isPendingMessageId } from "@/features/chat/utils/pendingMessage";

type Props = {
    message: MessageWithDetails;
    isOwn: boolean;
    hasSingleViewer: boolean;
    isLastMessage?: boolean;
    onToggleReaction: (emoji: string, reactedByMe: boolean) => void;
    onRequestDelete: (message: MessageWithDetails) => void;
};

// The text/reactions/toolbar for one message, shared between the group's
// first row (which also carries the avatar and header) and every later row
// (which is just this). Relies on an ancestor `group/line` for the hover
// reveal, provided by whichever row renders it.
//
// Doesn't own a delete dialog itself: only one message can ever be mid-delete
// at a time for this client, so that dialog is hoisted to a single instance
// shared by the whole list (see MessageList) instead of one heavy component
// (its own mutation + peer-chat subscription) mounted per message.
export const MessageLineContent = ({
    message,
    isOwn,
    hasSingleViewer,
    isLastMessage = false,
    onToggleReaction,
    onRequestDelete,
}: Props) => {
    const [isEditing, setIsEditing] = useState(false);
    const isPending = isPendingMessageId(message.id);

    if (isEditing) {
        return (
            <EditMessageForm
                message={message}
                onCancel={() => setIsEditing(false)}
                onSaved={() => setIsEditing(false)}
            />
        );
    }

    return (
        <div className="relative pr-14">
            {message.content && (
                <p className="text-sm wrap-break-word whitespace-pre-wrap text-foreground">
                    {message.content}
                    <MessageEditedTag editedAt={message.editedAt} />
                </p>
            )}
            <MessageAttachments
                attachments={message.attachments}
                conversationId={message.conversationId}
                messageId={message.id}
            />
            <MessageReactionPills
                reactions={message.reactions}
                disabled={isPending}
                onToggle={onToggleReaction}
            />
            {isOwn && isLastMessage && (
                <MessageSeenByLabel seenBy={message.seenBy} hasSingleViewer={hasSingleViewer} />
            )}
            <MessageLineToolbar
                isOwn={isOwn}
                disabled={isPending}
                reactions={message.reactions}
                onToggleReaction={onToggleReaction}
                onEdit={() => setIsEditing(true)}
                onDelete={() => onRequestDelete(message)}
            />
        </div>
    );
};
