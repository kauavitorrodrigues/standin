const RTP_HEADER_MIN_BYTES = 12;
const SSRC_OFFSET = 8;

/**
 * Copies an RTP packet with another SSRC, so one encoded stream can feed many
 * producers that the media server sees as different senders.
 *
 * @returns The new packet, or null when the packet is too short to be RTP.
 */
export const rewriteSsrc = (packet: Buffer, ssrc: number): Buffer | null => {
    if (packet.length < RTP_HEADER_MIN_BYTES) return null;

    const copy = Buffer.from(packet);
    copy.writeUInt32BE(ssrc >>> 0, SSRC_OFFSET);
    return copy;
};
