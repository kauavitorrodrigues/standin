import { motion } from "motion/react";
import type { MessageWithDetails } from "@standin/contracts";
import { MessageLineContent } from "@/features/chat/components/views/messages/MessageLineContent";
import { MessageLineTimestamp } from "@/features/chat/components/views/messages/MessageLineTimestamp";
import {
    MESSAGE_EXIT,
    MESSAGE_ORIGINAL_CONTENT_KEY,
    NEW_MESSAGE_ENTER_ANIMATE,
    NEW_MESSAGE_ENTER_INITIAL,
} from "@/features/chat/consts/messages";

type Props = {
    message: MessageWithDetails;
    isOwn: boolean;
    hasSingleViewer: boolean;
    isNew?: boolean;
    isEdited?: boolean;
    isLastMessage?: boolean;
    onToggleReaction: (emoji: string, reactedByMe: boolean) => void;
    onRequestDelete: (message: MessageWithDetails) => void;
};

// Two nested motion elements, not one: the outer one owns `message.id` as
// its identity (delete's exit animation depends on that key staying put),
// while the inner one is keyed by `editedAt` so an edit can replay the
// same entrance without registering as an add/remove with AnimatePresence.
//
// Own messages skip enter/exit animation entirely. An optimistic send is
// later reconciled with the server response under a new id, which
// AnimatePresence sees as a remove+add even though nothing visually
// changed; animation is only meant to draw attention to incoming messages
// from someone else.
//
// No `layout` prop: it made deleting one row reflow the rest with an
// animated slide, which read as a glitch alongside the row's own exit
// animation. Remaining rows now just snap into place.
export const MessageLine = ({
    message,
    isOwn,
    hasSingleViewer,
    isNew = false,
    isEdited = false,
    isLastMessage = false,
    onToggleReaction,
    onRequestDelete,
}: Props) => (
    <motion.div
        initial={isOwn ? false : isNew ? NEW_MESSAGE_ENTER_INITIAL : false}
        animate={NEW_MESSAGE_ENTER_ANIMATE}
        exit={isOwn ? undefined : MESSAGE_EXIT}
        className="group/line relative rounded-md py-1 pr-3 pl-13 hover:bg-muted/20"
    >
        <motion.div
            key={message.editedAt ?? MESSAGE_ORIGINAL_CONTENT_KEY}
            initial={isEdited ? NEW_MESSAGE_ENTER_INITIAL : false}
            animate={NEW_MESSAGE_ENTER_ANIMATE}
        >
            <MessageLineTimestamp createdAt={message.createdAt} />
            <MessageLineContent
                message={message}
                isOwn={isOwn}
                hasSingleViewer={hasSingleViewer}
                isLastMessage={isLastMessage}
                onToggleReaction={onToggleReaction}
                onRequestDelete={onRequestDelete}
            />
        </motion.div>
    </motion.div>
);
