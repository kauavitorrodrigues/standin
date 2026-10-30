import { LibrarySeedFileSchema } from "@standin/contracts";
import type { LibrarySeedFile } from "@standin/contracts";
import type { ZodSafeParseResult } from "zod/v4";
import type { ErrorIssue, LibraryTextCheck } from "../../../types";
import { joinIssuePath } from "../../../utils/joinIssuePath";
import { CONTENT_MESSAGES, LIBRARY_FILE } from "../consts";
import { collectLibraryFiles } from "./collectLibraryFiles";
import { countLibrary } from "./countLibrary";

// The text of library.json against the schema the server uses, and the files
// it names. Nothing is thrown: every problem is an issue of the file.
export const checkLibraryText = (text: string): LibraryTextCheck => {
    let json: unknown;
    try {
        json = JSON.parse(text);
    } catch (error) {
        const reason: string = (error as Error).message;
        return {
            ok: false,
            issues: [
                {
                    file: LIBRARY_FILE,
                    message: CONTENT_MESSAGES.libraryJsonNotJson(reason),
                },
            ],
        };
    }

    const parsed: ZodSafeParseResult<LibrarySeedFile> =
        LibrarySeedFileSchema.safeParse(json);
    if (!parsed.success) {
        const issues: ErrorIssue[] = parsed.error.issues.map((issue) => ({
            file: LIBRARY_FILE,
            path: joinIssuePath(issue.path),
            message: issue.message,
        }));
        return { ok: false, issues };
    }
    return {
        ok: true,
        counts: countLibrary(parsed.data),
        refs: collectLibraryFiles(parsed.data),
    };
};
