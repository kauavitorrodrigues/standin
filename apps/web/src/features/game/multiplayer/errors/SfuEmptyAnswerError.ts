/** The media server answered a request with nothing at all. */
export class SfuEmptyAnswerError extends Error {
    constructor() {
        super("The media server sent an empty answer.");
        this.name = "SfuEmptyAnswerError";
    }
}
