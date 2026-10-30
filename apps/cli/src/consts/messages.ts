import type { DryRunNoteParams } from "../types";

const GENERATED_PASSWORD_PREFIX =
    "  generated password (shown only now, store it): ";

const passwordNote = (passwordProvided: boolean): string => {
    if (passwordProvided) return "with the given password";
    return "with a generated password";
};

// Text the commands print, kept here so the run functions hold no wording.
export const MESSAGES = {
    stepLine: (label: string): string => `✓ ${label}`,
    generatedPassword: (password: string): string =>
        `${GENERATED_PASSWORD_PREFIX}${password}`,
    inputValid: "✓ input is valid",
    dryRunNoDatabase:
        "  dry run: the database was not read and nothing was written",
    dryRunBootstrapPlan: (params: DryRunNoteParams): string =>
        `  a real run creates the admin ${params.email} ${passwordNote(params.passwordProvided)} and the organization "${params.organizationName}", each only if it does not exist yet`,
    seedValid: (label: string, key: string): string =>
        `✓ ${label} ${key}: valid`,
    seedAction: (label: string, key: string, action: string): string =>
        `✓ ${label} ${key}: ${action}`,
    healthLine: (mark: string, status: string, ms: number): string =>
        `${mark} instance is ${status} (checked in ${ms} ms)`,
    healthMarkOk: "✓",
    healthMarkWarn: "!",
    adminEmailQuestion: "Admin email",
} as const;
