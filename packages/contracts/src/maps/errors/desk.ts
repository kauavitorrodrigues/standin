import { BaseError } from "../../errors/base";

export class DeskNotFoundError extends BaseError {
    constructor() {
        super("Mesa não encontrada.", "DESK_NOT_FOUND", 404);
    }
}

export class DeskAlreadyClaimedError extends BaseError {
    constructor() {
        super("Esta mesa já tem dono.", "DESK_ALREADY_CLAIMED", 409);
    }
}

export class UserAlreadyHasDeskError extends BaseError {
    constructor() {
        super(
            "Você já tem uma mesa neste espaço. Libere-a antes de reivindicar outra.",
            "USER_ALREADY_HAS_DESK",
            409
        );
    }
}

export class DeskClaimedError extends BaseError {
    constructor() {
        super(
            "Esta mesa tem dono. Confirme a liberação para apagá-la.",
            "DESK_CLAIMED",
            409
        );
    }
}

export class DeskUserNotMemberError extends BaseError {
    constructor() {
        super(
            "A pessoa precisa ser membro da organização do espaço.",
            "DESK_USER_NOT_MEMBER",
            422
        );
    }
}
