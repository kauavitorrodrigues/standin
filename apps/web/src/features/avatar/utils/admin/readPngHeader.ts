import { PNG_HEADER, PNG_SIGNATURE } from "../../consts/partForms";

export type PngHeader = {
    width: number;
    height: number;
    bitDepth: number;
    colorType: number;
};

// Reads the IHDR chunk of a PNG from its first bytes. Null when the bytes are
// not a PNG.
export const parsePngHeader = (bytes: Uint8Array): PngHeader | null => {
    if (bytes.length < PNG_HEADER.LENGTH) return null;
    const hasSignature = PNG_SIGNATURE.every(
        (byte, index) => bytes[index] === byte
    );
    if (!hasSignature) return null;

    const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
    return {
        width: view.getUint32(PNG_HEADER.WIDTH_OFFSET),
        height: view.getUint32(PNG_HEADER.HEIGHT_OFFSET),
        bitDepth: bytes[PNG_HEADER.BIT_DEPTH_OFFSET],
        colorType: bytes[PNG_HEADER.COLOR_TYPE_OFFSET],
    };
};

export const readPngHeader = async (file: File): Promise<PngHeader | null> => {
    const head = await file.slice(0, PNG_HEADER.LENGTH).arrayBuffer();
    return parsePngHeader(new Uint8Array(head));
};
