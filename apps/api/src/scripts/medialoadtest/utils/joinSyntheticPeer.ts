import type { SpaceMedia } from "@standin/media";
import { MEDIA_TEST_LISTEN_IP } from "../consts";
import type { Feeds, PersonStreams } from "../types";
import {
    buildAudioParameters,
    buildVideoParameters,
} from "./buildRtpParameters";

/**
 * Adds a synthetic person to the room with plain transports. The send
 * transport takes the RTP of the feeds under the SSRC of each stream, and the
 * receive transport sends everything it forwards to a sink.
 */
export const joinSyntheticPeer = async (
    room: SpaceMedia,
    peerId: string,
    sinkPort: number,
    streams: PersonStreams,
    feeds: Feeds
): Promise<void> => {
    room.addPeer(peerId, `user-${peerId}`);
    const plain = (comedia: boolean) =>
        room.router.createPlainTransport({
            listenInfo: { protocol: "udp", ip: MEDIA_TEST_LISTEN_IP },
            rtcpMux: true,
            comedia,
        });
    const [send, recv] = await Promise.all([plain(true), plain(false)]);
    await recv.connect({ ip: MEDIA_TEST_LISTEN_IP, port: sinkPort });
    room.attachTransports(peerId, {
        send,
        recv,
        rtpCapabilities: room.rtpCapabilities,
    });

    const sendPort = send.tuple.localPort;
    if (streams.mic !== null) {
        await room.produce(
            peerId,
            send.id,
            "mic",
            buildAudioParameters(streams.mic)
        );
        feeds.audio?.addTarget(streams.mic, sendPort);
    }
    if (streams.camera !== null) {
        await room.produce(
            peerId,
            send.id,
            "camera",
            buildVideoParameters(streams.camera)
        );
        streams.camera.forEach((ssrc, layer) =>
            feeds.video[layer]?.addTarget(ssrc, sendPort)
        );
    }
    if (streams.screen !== null) {
        await room.produce(
            peerId,
            send.id,
            "screen",
            buildVideoParameters([streams.screen])
        );
        // A screen is one layer, so it takes the sharpest feed.
        feeds.video[feeds.video.length - 1]?.addTarget(
            streams.screen,
            sendPort
        );
    }
};
