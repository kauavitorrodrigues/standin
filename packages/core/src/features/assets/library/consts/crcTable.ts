import { BITS_PER_BYTE, CRC_POLYNOMIAL, CRC_TABLE_SIZE } from "./png";

const buildCrcTable = (): Uint32Array => {
    const table = new Uint32Array(CRC_TABLE_SIZE);

    for (let n = 0; n < CRC_TABLE_SIZE; n++) {
        let c = n;
        for (let k = 0; k < BITS_PER_BYTE; k++) {
            c = c & 1 ? CRC_POLYNOMIAL ^ (c >>> 1) : c >>> 1;
        }
        table[n] = c >>> 0;
    }

    return table;
};

export const CRC_TABLE = buildCrcTable();
