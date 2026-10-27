// Whitespace-only content counts as empty, same normalization the backend
// schema applies. Kept in sync here so the composer and the typing
// indicator agree on what "has content" means.
export const hasTypedContent = (content: string | undefined): boolean =>
    (content ?? "").trim().length > 0;

type CanSendMessageParams = {
    isSubmitting: boolean;
    content: string | undefined;
    attachmentCount: number;
};

export const canSendMessage = ({
    isSubmitting,
    content,
    attachmentCount,
}: CanSendMessageParams): boolean =>
    !isSubmitting && (hasTypedContent(content) || attachmentCount > 0);

// The composer of a thread asks for a reply, the one of the list for a message.
export const getComposerPlaceholder = (
    threadParentId: string | undefined
): string =>
    threadParentId === undefined
        ? "Escreva uma mensagem..."
        : "Responder na conversa...";
