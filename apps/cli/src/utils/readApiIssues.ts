import type { ApiErrorBody, ErrorIssue } from "../types";
import { readFieldIssues } from "./readFieldIssues";
import { readFormIssues } from "./readFormIssues";
import { readListedIssues } from "./readListedIssues";

// The problems the server lists: `errors` (publish, library), or the fields of
// a body that failed its schema.
export const readApiIssues = (body: ApiErrorBody): ErrorIssue[] => [
    ...readListedIssues(body.errors),
    ...readFieldIssues(body.fieldErrors),
    ...readFormIssues(body.formErrors),
];
