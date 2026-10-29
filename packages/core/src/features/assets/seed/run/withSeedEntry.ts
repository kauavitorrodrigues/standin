import { BaseError, LibrarySeedEntryError } from "@standin/contracts";
import { readIssues } from "../utils/readIssues";

/**
 * Runs the work of one entry and, when a service refuses it, rethrows the
 * refusal with the entry named, so a file with many entries says which one.
 */
export const withSeedEntry = async <T>(
    entry: string,
    run: () => Promise<T>
): Promise<T> => {
    try {
        return await run();
    } catch (error) {
        if (!(error instanceof BaseError)) throw error;
        throw new LibrarySeedEntryError(entry, error, readIssues(error));
    }
};
