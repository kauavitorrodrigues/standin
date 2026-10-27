/**
 * The media server answered a request with a failure. `code` is the code of
 * the error on the server, for example MEDIA_TRANSPORT_EXISTS.
 */
export class SfuRequestRejectedError extends Error {
    readonly code: string;

    constructor(code: string) {
        super("The media server refused the request.");
        this.name = "SfuRequestRejectedError";
        this.code = code;
    }
}
