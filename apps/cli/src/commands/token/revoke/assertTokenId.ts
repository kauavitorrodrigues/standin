import { z } from "zod/v4";
import { TokenIdInvalidError } from "../../../errors/TokenIdInvalidError";

// The id of a token is a UUID; anything else cannot exist, and the database
// would only fail on it.
export const assertTokenId = (id: string): void => {
    if (z.uuid().safeParse(id).success) return;
    throw new TokenIdInvalidError();
};
