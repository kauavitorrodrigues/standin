import { ServiceTokenCreateSchema } from "@standin/contracts";
import { SERVICE_TOKEN_VALIDATION_MESSAGES as Messages } from "../consts/messages";
import { resolveExpiryDay } from "./resolveExpiryDay";
import type {
    CreateTokenField,
    CreateTokenFieldErrors,
    CreateTokenFormValues,
    CreateTokenPayload,
    CreateTokenValidation,
} from "../types";

// The expiry covers the whole chosen day, so it is the last second of it, in
// the time zone of the admin.
const toEndOfDay = (day: string): string | null => {
    const date = new Date(`${day}T23:59:59`);
    if (Number.isNaN(date.getTime())) return null;
    return date.toISOString();
};

type IssueLike = { code: string; path: PropertyKey[] };

const getIssueField = (issue: IssueLike): CreateTokenField => {
    switch (issue.path[0]) {
        case "scopes":
            return "scopes";
        case "expiresAt":
            return "expiresOn";
        default:
            return "name";
    }
};

const getIssueMessage = (issue: IssueLike): string => {
    switch (getIssueField(issue)) {
        case "scopes":
            return Messages.SCOPES_REQUIRED;
        case "expiresOn":
            return Messages.EXPIRY_PAST;
        default:
            return issue.code === "too_big"
                ? Messages.NAME_TOO_LONG
                : Messages.NAME_REQUIRED;
    }
};

// Checks the form with the same schema the API uses and builds the body of
// the request. Every field with a problem gets its message in Portuguese.
export const validateCreateToken = (
    values: CreateTokenFormValues,
    now: Date = new Date()
): CreateTokenValidation => {
    const payload: CreateTokenPayload = {
        name: values.name.trim(),
        scopes: values.scopes,
    };

    const day = resolveExpiryDay(values.expiry, values.expiresOn, now);
    if (day !== null) {
        const expiresAt = toEndOfDay(day);
        if (!expiresAt)
            return {
                ok: false,
                errors: { expiresOn: Messages.EXPIRY_INVALID },
            };
        payload.expiresAt = expiresAt;
    }

    const result = ServiceTokenCreateSchema.safeParse(payload);
    if (result.success) return { ok: true, payload };

    const errors: CreateTokenFieldErrors = {};
    for (const issue of result.error.issues) {
        const field = getIssueField(issue);
        errors[field] ??= getIssueMessage(issue);
    }
    return { ok: false, errors };
};
