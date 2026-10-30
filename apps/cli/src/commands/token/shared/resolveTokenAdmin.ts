import { TokenAdminAmbiguousError } from "../../../errors/TokenAdminAmbiguousError";
import { TokenAdminMissingError } from "../../../errors/TokenAdminMissingError";
import { TokenAdminNotFoundError } from "../../../errors/TokenAdminNotFoundError";
import type { TokenAdmin } from "../../../types";
import { findAdminByEmail } from "./findAdminByEmail";

// Who owns the token. A token acts as an active admin, so the owner is one:
// the email given, or the only admin there is. With several and no email
// nothing is guessed.
export const resolveTokenAdmin = (
    admins: TokenAdmin[],
    email: string | undefined
): TokenAdmin => {
    const emails: string[] = admins.map((admin) => admin.email);
    if (email) {
        const found: TokenAdmin | undefined = findAdminByEmail(admins, email);
        if (found) return found;
        throw new TokenAdminNotFoundError(email, emails);
    }

    const [only] = admins;
    if (!only) throw new TokenAdminMissingError();
    if (admins.length > 1) throw new TokenAdminAmbiguousError(emails);
    return only;
};
