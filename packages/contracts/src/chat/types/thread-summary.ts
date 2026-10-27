// The display-ready state of a thread after a reply, sent with that reply so
// the parent message shows its new count and last reply with no refetch.
export type ThreadSummary = {
    parentId: string;
    replyCount: number;
    lastReplyAt: string | null;
    lastReplyPreview: string | null;
};
