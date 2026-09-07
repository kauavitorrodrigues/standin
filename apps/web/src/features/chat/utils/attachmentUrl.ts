type ResolveAttachmentUrlParams = {
    organizationId: string;
    conversationId: string;
    messageId: string;
    attachmentId: string;
};

// Attachments live behind conversation access control, not the public
// static bucket, so the URL always goes through the authenticated API
// route (cookie-based auth, same as every other API request).
export const resolveAttachmentUrl = ({
    organizationId,
    conversationId,
    messageId,
    attachmentId,
}: ResolveAttachmentUrlParams) =>
    `${import.meta.env.VITE_BASE_API_URL}/organizations/${organizationId}/conversations/${conversationId}/messages/${messageId}/attachments/${attachmentId}`;
