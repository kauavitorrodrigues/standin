import type { ApiErrorBody, ErrorIssue } from "../types";
import { readFieldIssues } from "./readFieldIssues";
import { readFormIssues } from "./readFormIssues";
import { readListedIssues } from "./readListedIssues";
import { readSeedIssues } from "./readSeedIssues";

// The problems the server lists: `errors` (publish, library), the lists of a
// library seed error, or the fields of a body that failed its schema.
export const readApiIssues = (body: ApiErrorBody): ErrorIssue[] => [
    ...readListedIssues(body.errors),
    ...readSeedIssues(body),
    ...readFieldIssues(body.fieldErrors),
    ...readFormIssues(body.formErrors),
];
