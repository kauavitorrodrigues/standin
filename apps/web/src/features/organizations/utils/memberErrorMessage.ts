import { isAxiosError } from "axios";
import { OrganizationMessages } from "../consts/messages";

const KNOWN_CODES: Record<string, string> = {
    ORGANIZATION_MEMBER_NOT_FOUND: OrganizationMessages.MEMBER_NOT_FOUND,
    ORGANIZATION_OWNER_CANNOT_BE_REMOVED:
        OrganizationMessages.OWNER_CANNOT_BE_REMOVED,
    ORGANIZATION_OWNER_CANNOT_LEAVE: OrganizationMessages.OWNER_CANNOT_LEAVE,
};

// The server answers with a code, and the copy for it is written here. Any
// other failure gets the generic message of the action.
export const memberErrorMessage = (
    error: unknown,
    fallback: string
): string => {
    if (!isAxiosError(error)) return fallback;
    const code: unknown = error.response?.data?.code;
    if (typeof code !== "string") return fallback;
    return KNOWN_CODES[code] ?? fallback;
};
