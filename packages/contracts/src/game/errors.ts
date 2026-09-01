import { BaseError } from "../errors/base";

export class SocketNotInitializedError extends BaseError {
    constructor() {
        super(
            "O Socket.IO ainda não foi inicializado.",
            "SOCKET_NOT_INITIALIZED",
            500
        );
    }
}

// Reserved for a future phase that surfaces join/signal failures back to
// the client; today the socket handlers just drop unauthorized events.
export class SpaceNotJoinedError extends BaseError {
    constructor() {
        super(
            "Você precisa entrar no space antes de continuar.",
            "SPACE_NOT_JOINED",
            400
        );
    }
}
