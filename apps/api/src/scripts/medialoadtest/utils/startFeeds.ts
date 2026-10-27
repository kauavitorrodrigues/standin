import { createSocket } from "node:dgram";
import { AUDIO_FEED_PORT, type VideoFeedSpec } from "../consts";
import type { Feeds } from "../types";
import { buildAudioFeedArgs, buildVideoFeedArgs } from "./buildFfmpegArgs";
import { createFanout } from "./createFanout";
import { startFfmpeg } from "./startFfmpeg";

/**
 * Starts the encoders the test needs. One ffmpeg per audio feed and one per
 * video layer drives every synthetic sender through its fan-out.
 */
export const startFeeds = async (
    needsAudio: boolean,
    videoLayers: VideoFeedSpec[]
): Promise<Feeds> => {
    const stops: (() => void)[] = [];
    const output = createSocket("udp4");
    const audio = needsAudio
        ? await createFanout(AUDIO_FEED_PORT, output)
        : null;
    const video = await Promise.all(
        videoLayers.map((layer) => createFanout(layer.port, output))
    );
    if (audio) stops.push(await startFfmpeg(buildAudioFeedArgs()));
    for (const layer of videoLayers) {
        stops.push(await startFfmpeg(buildVideoFeedArgs(layer)));
    }

    return {
        audio,
        video,
        stop: () => {
            stops.forEach((stop) => stop());
            audio?.close();
            video.forEach((fanout) => fanout.close());
            output.close();
        },
    };
};
