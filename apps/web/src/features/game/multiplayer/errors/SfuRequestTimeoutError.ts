/** The media server did not answer a request in time. */
export class SfuRequestTimeoutError extends Error {
    constructor() {
        super("The media server did not answer in time.");
        this.name = "SfuRequestTimeoutError";
    }
}
