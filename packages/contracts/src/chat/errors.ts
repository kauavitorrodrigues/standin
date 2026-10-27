import { BaseError } from "../errors/base";

export class ConversationNotFoundError extends BaseError {
    constructor() {
        super("Conversation not found.", "CONVERSATION_NOT_FOUND", 404);
    }
}

export class MessageNotFoundError extends BaseError {
    constructor() {
        super("Message not found.", "MESSAGE_NOT_FOUND", 404);
    }
}

export class MessageAccessDeniedError extends BaseError {
    constructor() {
        super(
            "You can only manage your own messages.",
            "MESSAGE_ACCESS_DENIED",
            403
        );
    }
}

export class AttachmentNotFoundError extends BaseError {
    constructor() {
        super("Attachment not found.", "ATTACHMENT_NOT_FOUND", 404);
    }
}

export class DirectConversationTooLargeError extends BaseError {
    constructor() {
        super(
            "A direct conversation has a limit on how many people it can include.",
            "DIRECT_CONVERSATION_TOO_LARGE",
            400
        );
    }
}

export class ConversationRecipientAccessDeniedError extends BaseError {
    constructor() {
        super(
            "The recipient is not an active member of this organization.",
            "CONVERSATION_RECIPIENT_ACCESS_DENIED",
            403
        );
    }
}

export class NestedThreadError extends BaseError {
    constructor() {
        super(
            "A reply cannot be started on another reply.",
            "NESTED_THREAD",
            400
        );
    }
}
