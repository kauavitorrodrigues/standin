export const SEAL_ALGORITHM = "aes-256-gcm";
export const SEAL_IV_BYTES = 12;
// Mixed into the key so it differs from any other use of the server secret.
export const SEAL_KEY_CONTEXT = "standin:invite-link";
export const SEAL_PART_SEPARATOR = ".";
export const SEAL_PART_ENCODING = "base64url";
