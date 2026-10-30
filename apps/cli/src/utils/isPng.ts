import { PNG_SIGNATURE } from "../consts/png";

// True when the bytes start with the signature of a PNG. The server checks the
// image itself; this keeps an obvious mistake from costing a request.
export const isPng = (bytes: Uint8Array): boolean => {
    if (bytes.length < PNG_SIGNATURE.length) return false;
    return PNG_SIGNATURE.every((byte, index) => bytes[index] === byte);
};
