import { CRC_INITIAL } from "../consts/png";
import { CRC_TABLE } from "../consts/crcTable";

const BYTE_MASK = 0xff;
const BYTE_BITS = 8;

export const crc32 = (buffer: Buffer): number => {
    let crc = CRC_INITIAL;

    for (const byte of buffer) {
        crc = CRC_TABLE[(crc ^ byte) & BYTE_MASK] ^ (crc >>> BYTE_BITS);
    }

    return (crc ^ CRC_INITIAL) >>> 0;
};
