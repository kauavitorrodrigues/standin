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
    issueLine: (text: string): string => `  - ${text}`,
    detailLine: (name: string, value: unknown): string =>
        `  ${name}: ${JSON.stringify(value)}`,
    scopeMissingFix: (scope: string): string =>
        `Create a token with the "${scope}" scope: \`pnpm -s standin token create --name <name> --scope ${scope}\`, then \`pnpm -s standin login\`.`,
} as const;

// What the CLI says about the parts of a library seed upload.
export const SEED_UPLOAD_MESSAGES = {
    fileMissing: "the file was not uploaded",
} as const;

// Why a file cannot be used, in words that follow its name.
export const FILE_PROBLEMS = {
    missing: "the file does not exist",
    unreadable: (code: string): string => `it cannot be read (${code})`,
    tooLarge: (size: string, max: string): string =>
        `it is ${size}, over the limit of ${max}`,
    notPng: "it is not a PNG",
    outsideFolder:
        "it resolves outside the content folder, and a link that leaves the folder is not followed",
} as const;

// What a command that writes in steps says when one of them failed.
export const STEPS_MESSAGES = {
    unfinished: (name: string, id: string): string =>
        `The template "${name}" (${id}) was created but not finished: finish it in the editor, publish it with \`pnpm -s standin template publish ${id}\`, or delete it on the admin screen and run the command again.`,
    uncertain: (target: string, name: string, listCommand: string): string =>
        `The last write (${target} "${name}") may have happened before the connection failed: check \`pnpm -s standin ${listCommand}\` before running the command again.`,
} as const;
