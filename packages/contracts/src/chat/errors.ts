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
