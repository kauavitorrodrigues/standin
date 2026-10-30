import { SEED_UPLOAD_MESSAGES } from "../consts/messages";
import type { ApiErrorBody, ErrorIssue } from "../types";
import { readStringList } from "./readStringList";

// What a library seed error lists: the problems of library.json (`issues`),
// and the files the upload lacks (`paths`), each one an entry.
export const readSeedIssues = (body: ApiErrorBody): ErrorIssue[] => [
    ...readStringList(body.issues).map((message) => ({ message })),
    ...readStringList(body.paths).map((file) => ({
        file,
        message: SEED_UPLOAD_MESSAGES.fileMissing,
    })),
];
