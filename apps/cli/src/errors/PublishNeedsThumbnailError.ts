import { FLAGS, SPEC_FIELDS } from "../consts/flags";
import { EXIT_CODES } from "../consts/exitCodes";
import { CliError } from "./CliError";

// --publish on a new template that has no thumbnail: the server refuses to
// publish a template without one, so no request is sent.
export class PublishNeedsThumbnailError extends CliError {
    constructor() {
        super(
            `${FLAGS.PUBLISH} needs a thumbnail: a template is published with one.`,
            "CLI_PUBLISH_NEEDS_THUMBNAIL",
            400,
            EXIT_CODES.USAGE,
            {
                path: FLAGS.THUMBNAIL,
                fix: `Pass ${FLAGS.THUMBNAIL} <png>, or leave ${FLAGS.PUBLISH} out and publish later with \`pnpm -s standin template publish <id>\`.`,
            }
        );
    }
}
