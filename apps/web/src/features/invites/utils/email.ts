import { z } from "zod/v4";
import type { ParsedEmails } from "../types";

const EmailSchema = z.email();

const isEmail = (text: string): boolean => EmailSchema.safeParse(text).success;

/**
 * Splits what the owner typed by comma, semicolon, space or line break, lower
 * cases it and drops repeats. What is not an e-mail comes back apart, so the
 * form can point at it.
 */
export const parseEmails = (text: string): ParsedEmails => {
    const parts = text
        .split(/[\s,;]+/)
        .map((part) => part.trim().toLowerCase())
        .filter(Boolean);

    const unique = [...new Set(parts)];
    return {
        emails: unique.filter(isEmail),
        invalid: unique.filter((part) => !isEmail(part)),
    };
};
