import type { SEAL_CONTEXTS } from "./consts";
// The three parts of a sealed value, in the order they are written.
export type SealedParts = {
    iv: Buffer;
    authTag: Buffer;
    body: Buffer;
};

// What a row keeps of a token that can be read back.
export type SealedTokenColumn = {
    tokenEncrypted: string | null;
};

export type SealContext = (typeof SEAL_CONTEXTS)[keyof typeof SEAL_CONTEXTS];
