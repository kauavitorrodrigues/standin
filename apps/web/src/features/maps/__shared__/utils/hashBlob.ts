const HASH_ALGORITHM = "SHA-256";
const HEX_RADIX = 16;
const HEX_BYTE_LENGTH = 2;

// A fingerprint of the bytes of a blob, to tell two photos apart without
// keeping either. Rejects where the browser has no `crypto.subtle` (outside a
// secure context), and the caller then treats the photo as new.
export const hashBlob = async (blob: Blob): Promise<string> => {
    const digest = await crypto.subtle.digest(
        HASH_ALGORITHM,
        await blob.arrayBuffer()
    );

    return [...new Uint8Array(digest)]
        .map((byte) => byte.toString(HEX_RADIX).padStart(HEX_BYTE_LENGTH, "0"))
        .join("");
};
