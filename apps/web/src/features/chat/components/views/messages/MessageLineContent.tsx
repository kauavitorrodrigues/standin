import { useState } from "react";
import type { MessageWithDetails } from "@standin/contracts";
import { MessageReactionPills } from "@/features/chat/components/views/messages/MessageReactionPills";
import { MessageAttachments } from "@/features/chat/components/views/messages/MessageAttachments";
import { MessageLineToolbar } from "@/features/chat/components/views/messages/MessageLineToolbar";
import { MessageEditedTag } from "@/features/chat/components/views/messages/MessageEditedTag";
import { EditMessageForm } from "@/features/chat/components/forms/EditMessageForm";
import { DeleteMessageDialog } from "@/features/chat/components/dialogs/DeleteMessageDialog";

type Props = {
    message: MessageWithDetails;
    isOwn: boolean;
    onToggleReaction: (emoji: string, reactedByMe: boolean) => void;
};

// The text/reactions/toolbar for one message, shared between the group's
// first row (which also carries the avatar and header) and every later row
// (which is just this). Relies on an ancestor `group/line` for the hover
// reveal, provided by whichever row renders it.
export const MessageLineContent = ({
    message,
    isOwn,
    onToggleReaction,
}: Props) => {
    const [isEditing, setIsEditing] = useState(false);
    const [isDeleteDialogOpen, setDeleteDialogOpen] = useState(false);

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
            <p className="text-sm wrap-break-word whitespace-pre-wrap text-foreground">
                {message.content}
                <MessageEditedTag editedAt={message.editedAt} />
            </p>
            <MessageAttachments attachments={message.attachments} />
            <MessageReactionPills
                reactions={message.reactions}
                onToggle={onToggleReaction}
            />
            <MessageLineToolbar
                isOwn={isOwn}
                reactions={message.reactions}
                onToggleReaction={onToggleReaction}
                onEdit={() => setIsEditing(true)}
                onDelete={() => setDeleteDialogOpen(true)}
            />
            <DeleteMessageDialog
                message={message}
                open={isDeleteDialogOpen}
                onOpenChange={setDeleteDialogOpen}
            />
        </div>
    );
};
