export const SEAL_ALGORITHM = "aes-256-gcm";
export const SEAL_IV_BYTES = 12;
// Mixed into the key so each use of the same secret gets its own key: a value
// sealed for one use cannot be opened as another, and the uses do not break
// each other.
export const SEAL_CONTEXTS = {
    INVITE_LINK: "standin:invite-link",
    INTEGRATION: "standin:integration",
} as const;
export const SEAL_PART_SEPARATOR = ".";
export const SEAL_PART_ENCODING = "base64url";
