import { readCauseMessage } from "../utils/readCauseMessage";

const UNEXPECTED_MESSAGE = "Unexpected error.";

// The message of an error the CLI does not know. Its own message is not
// shown: a query error carries the SQL and the bound values. Only the cause
// is, without the parameters.
export const describeError = (error: unknown): string => {
    const cause: string | undefined = readCauseMessage(error);
    if (!cause) return UNEXPECTED_MESSAGE;
    return `${UNEXPECTED_MESSAGE} ${cause}`;
};
