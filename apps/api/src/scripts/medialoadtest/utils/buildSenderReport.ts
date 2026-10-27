const RTCP_SENDER_REPORT = 200;
const SENDER_REPORT_WORDS = 6;
// Seconds between 1900, where NTP starts, and 1970, where Date.now() does.
const NTP_UNIX_OFFSET_SEC = 2_208_988_800;
const TWO_POW_32 = 2 ** 32;

type SenderReport = {
    ssrc: number;
    nowMs: number;
    rtpTimestamp: number;
    packetCount: number;
    octetCount: number;
};

/**
 * An RTCP sender report with no report blocks. The media server needs it to
 * line up the layers of a simulcast camera, which the ffmpeg feeds do not
 * send on the port of the transport.
 */
export const buildSenderReport = ({
    ssrc,
    nowMs,
    rtpTimestamp,
    packetCount,
    octetCount,
}: SenderReport): Buffer => {
    const report = Buffer.alloc((SENDER_REPORT_WORDS + 1) * 4);
    const seconds = nowMs / 1000 + NTP_UNIX_OFFSET_SEC;
    report[0] = 0x80;
    report[1] = RTCP_SENDER_REPORT;
    report.writeUInt16BE(SENDER_REPORT_WORDS, 2);
    report.writeUInt32BE(ssrc >>> 0, 4);
    report.writeUInt32BE(Math.floor(seconds) >>> 0, 8);
    report.writeUInt32BE(
        Math.floor((seconds % 1) * TWO_POW_32) >>> 0,
        12
    );
    report.writeUInt32BE(rtpTimestamp >>> 0, 16);
    report.writeUInt32BE(packetCount >>> 0, 20);
    report.writeUInt32BE(octetCount >>> 0, 24);
    return report;
};
