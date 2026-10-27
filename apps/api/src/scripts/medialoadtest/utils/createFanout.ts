import { createSocket, type Socket } from "node:dgram";
import { buildSenderReport } from "./buildSenderReport";
import { rewriteSsrc } from "./rewriteSsrc";

type Target = {
    ssrc: number;
    port: number;
    packetCount: number;
    octetCount: number;
};

// How often a sender report goes out for each target.
const SENDER_REPORT_INTERVAL_MS = 1000;
// Where the RTP timestamp sits in the header.
const RTP_TIMESTAMP_OFFSET = 4;

export type Fanout = {
    /** Starts copying the feed to a local port under its own SSRC. */
    addTarget: (ssrc: number, port: number) => void;
    close: () => void;
};

/**
 * Listens for the RTP of one ffmpeg feed and sends a copy of every packet to
 * each target, with the SSRC rewritten. One encoder then drives as many
 * synthetic senders as the test needs.
 *
 * The output socket is shared by every fan-out of a run. A plain transport
 * with comedia keeps only the first source address it sees, so a person who
 * sends audio and video must receive both from the same socket.
 *
 * It also sends a sender report for each target every second, from the RTP
 * time of the last packet, because the server lines up the layers of a
 * simulcast camera with them.
 */
export const createFanout = async (
    feedPort: number,
    output: Socket
): Promise<Fanout> => {
    const targets: Target[] = [];
    const input: Socket = createSocket("udp4");

    let lastTimestamp = 0;

    input.on("message", (packet) => {
        if (packet.length >= RTP_TIMESTAMP_OFFSET + 4)
            lastTimestamp = packet.readUInt32BE(RTP_TIMESTAMP_OFFSET);
        targets.forEach((target) => {
            const copy = rewriteSsrc(packet, target.ssrc);
            if (!copy) return;
            target.packetCount += 1;
            target.octetCount += packet.length;
            output.send(copy, target.port, "127.0.0.1");
        });
    });
    const reports = setInterval(() => {
        const nowMs = Date.now();
        targets.forEach((target) => {
            if (target.packetCount === 0) return;
            output.send(
                buildSenderReport({
                    ssrc: target.ssrc,
                    nowMs,
                    rtpTimestamp: lastTimestamp,
                    packetCount: target.packetCount,
                    octetCount: target.octetCount,
                }),
                target.port,
                "127.0.0.1"
            );
        });
    }, SENDER_REPORT_INTERVAL_MS);
    await new Promise<void>((resolve) =>
        input.bind(feedPort, "127.0.0.1", resolve)
    );

    return {
        addTarget: (ssrc, port) =>
            targets.push({ ssrc, port, packetCount: 0, octetCount: 0 }),
        close: () => {
            clearInterval(reports);
            input.close();
        },
    };
};
