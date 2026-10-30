import { vi } from "vitest";
import type { CliFiles } from "../types";
import { UnexpectedFailure } from "./UnexpectedFailure";

// The files of the user from a table. A path that is not there fails like the
// file system does.
export const createFakeFiles = (
    files: Record<string, string> = {}
): CliFiles => ({
    readText: vi.fn(async (path: string) => {
        const text: string | undefined = files[path];
        if (text === undefined) {
            throw new UnexpectedFailure(`no such file: ${path}`, "ENOENT");
        }
        return text;
    }),
});
