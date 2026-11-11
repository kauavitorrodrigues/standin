import { EMBEDDED_WEBSITE_URL_MAX } from "./consts";

export const ObjectBehaviorErrorMessages = {
    behavior: { invalid: "The object behavior is invalid." },
    params: { invalid: "The behavior params are invalid." },
    url: {
        invalid: `The website address must be a valid https address of at most ${EMBEDDED_WEBSITE_URL_MAX} characters.`,
        ownOrigin: "The website address cannot point at this app.",
    },
    prefix: {
        invalid: `The address prefix must be a valid https address of at most ${EMBEDDED_WEBSITE_URL_MAX} characters.`,
    },
};
