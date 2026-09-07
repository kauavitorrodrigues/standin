import { useMemo } from "react";
import { AnimatePresence, motion } from "motion/react";
import { AvatarGroup, AvatarGroupCount } from "@/components/ui/avatar";
import { UserAvatar } from "@/features/users/components/UserAvatar";
import { usePeerTyping } from "@/features/chat/contexts/PeerTypingContext";
import { ChatQueries } from "@/features/chat/queries";
import { MAX_VISIBLE_TYPING_AVATARS } from "@/features/chat/consts/typing";
import { formatTypingLabel } from "@/features/chat/utils/formatTypingLabel";
import { buildParticipantAvatarLookup } from "@/features/chat/utils/participantAvatarLookup";

type Props = { conversationId: string };

export const TypingIndicator = ({ conversationId }: Props) => {
    const { getTypingUsers } = usePeerTyping();
    const { participants } = ChatQueries.useParticipants(conversationId);

    const avatarLookup = useMemo(
        () => buildParticipantAvatarLookup(participants),
        [participants]
    );

    const typingUsers = getTypingUsers(conversationId);
    const visibleUsers = typingUsers.slice(0, MAX_VISIBLE_TYPING_AVATARS);
    const hiddenCount = typingUsers.length - visibleUsers.length;

    return (
        // A normal row above the composer, not overlaid on the message
        // content. The row's own height animates from 0 to its content
        // height (and back) instead of mounting/unmounting outright, so
        // nothing above or below it jumps when it appears or disappears.
        <AnimatePresence initial={false}>
            {typingUsers.length > 0 && (
                <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2, ease: "easeOut" }}
                    className="overflow-hidden"
                >
                    <div className="flex items-center gap-2 px-4 pt-1 pb-2">
                        <AvatarGroup>
                            {visibleUsers.map(({ userId }) => (
                                <UserAvatar
                                    key={userId}
                                    id={userId}
                                    avatar={avatarLookup.get(userId) ?? null}
                                    size="xs"
                                />
                            ))}
                            {hiddenCount > 0 && (
                                <AvatarGroupCount>
                                    +{hiddenCount}
                                </AvatarGroupCount>
                            )}
                        </AvatarGroup>
                        <span className="text-muted-foreground shimmer text-xs italic">
                            {formatTypingLabel(
                                typingUsers.map((user) => user.userName)
                            )}
                        </span>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};
