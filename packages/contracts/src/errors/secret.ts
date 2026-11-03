import { BaseError } from "./base";

export class InviteLinkSecretMissingError extends BaseError {
    constructor() {
        super(
            "The server has no secret to keep invite links.",
            "INVITE_LINK_SECRET_MISSING",
            500
        );
    }
}
