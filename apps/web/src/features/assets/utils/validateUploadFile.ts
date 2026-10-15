import { MAX_UPLOAD_BYTES } from "@standin/contracts";
import { MAX_UPLOAD_KB, PNG_SIGNATURE } from "../consts/uploadFile";

const hasPngSignature = async (file: File) => {
    const head = new Uint8Array(
        await file.slice(0, PNG_SIGNATURE.length).arrayBuffer()
    );
    return PNG_SIGNATURE.every((byte, index) => head[index] === byte);
};

// Only what is cheap and saves a round trip: size and the PNG signature. The
// API decides the rest. Returns the message, or null.
export const validateUploadFile = async (
    file: File
): Promise<string | null> => {
    if (file.size > MAX_UPLOAD_BYTES) {
        return `O arquivo passa do limite de ${MAX_UPLOAD_KB} KB.`;
    }
    return (await hasPngSignature(file))
        ? null
        : "O arquivo não é um PNG válido.";
};
