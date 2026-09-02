import { ErrorMessages } from "@/enums/errorMessages";
import { BaseError } from "./base";

export class ShutdownTimeoutError extends BaseError {
    constructor() {
        super(ErrorMessages.SHUTDOWN_TIMEOUT, "SHUTDOWN_TIMEOUT", 500);
    }
}

export class ShutdownError extends BaseError {
    constructor() {
        super(ErrorMessages.SHUTDOWN_ERROR, "SHUTDOWN_ERROR", 500);
    }
}
