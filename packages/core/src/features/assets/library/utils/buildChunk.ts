import { ASCII_ENCODING } from "../../../../lib/consts/encoding";
import { crc32 } from "./crc32";

const LENGTH_BYTES = 4;

export const buildChunk = (type: string, data: Buffer): Buffer => {
    const length = Buffer.alloc(LENGTH_BYTES);
    length.writeUInt32BE(data.length);

    const body = Buffer.concat([Buffer.from(type, ASCII_ENCODING), data]);
    const crc = Buffer.alloc(LENGTH_BYTES);
    crc.writeUInt32BE(crc32(body));

    return Buffer.concat([length, body, crc]);
};
