import { normalizeEmail } from "@standin/contracts";
import type { TokenAdmin } from "../../../types";

export const findAdminByEmail = (
    admins: TokenAdmin[],
    email: string
): TokenAdmin | undefined => {
    const wanted: string = normalizeEmail(email);
    return admins.find((admin) => normalizeEmail(admin.email) === wanted);
};
