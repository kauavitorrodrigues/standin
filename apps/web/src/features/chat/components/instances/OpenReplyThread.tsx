import { ReplyThreadPanel } from "@/features/chat/components/instances/ReplyThreadPanel";

type Props = {
    conversationId: string;
    threadParentId: string | null;
    hasSingleViewer: boolean;
    onClose: () => void;
};

// The side panel of a thread, or nothing while none is open.
export const OpenReplyThread = ({
    conversationId,
    threadParentId,
    hasSingleViewer,
    onClose,
}: Props) => {
    if (!threadParentId) return null;

    return (
        <ReplyThreadPanel
            conversationId={conversationId}
            threadParentId={threadParentId}
            hasSingleViewer={hasSingleViewer}
            onClose={onClose}
        />
    );
};
