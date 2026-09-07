import { BaseError } from "../errors/base";

export class ConversationNotFoundError extends BaseError {
    constructor() {
        super("Conversa não encontrada.", "CONVERSATION_NOT_FOUND", 404);
    }
}

export class MessageNotFoundError extends BaseError {
    constructor() {
        super("Mensagem não encontrada.", "MESSAGE_NOT_FOUND", 404);
    }
}

export class MessageAccessDeniedError extends BaseError {
    constructor() {
        super(
            "Você só pode gerenciar suas próprias mensagens.",
            "MESSAGE_ACCESS_DENIED",
            403
        );
    }
}

export class AttachmentNotFoundError extends BaseError {
    constructor() {
        super("Anexo não encontrado.", "ATTACHMENT_NOT_FOUND", 404);
    }
}

export class SelfConversationNotAllowedError extends BaseError {
    constructor() {
        super(
            "Não é possível iniciar uma conversa consigo mesmo.",
            "SELF_CONVERSATION_NOT_ALLOWED",
            400
        );
    }
}

export class ConversationRecipientAccessDeniedError extends BaseError {
    constructor() {
        super(
            "O destinatário não é membro ativo desta organização.",
            "CONVERSATION_RECIPIENT_ACCESS_DENIED",
            403
        );
    }
}
