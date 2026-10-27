import {
    DEFAULT_MEDIA_LISTEN_IP,
    DEFAULT_MEDIA_LISTEN_PORT,
    DEFAULT_MEDIA_WORKERS,
    type MediaServerOptions,
} from "@standin/media";
import { parsePort } from "./utils/parsePort";

// The settings of the media server, read from the environment. One worker
// serves the whole process, so MEDIA_WORKERS only turns the server off when 0.
export const readMediaConfig = (
    env: NodeJS.ProcessEnv = process.env
): { enabled: boolean; options: MediaServerOptions } => {
    const listenIp = env.MEDIA_LISTEN_IP || DEFAULT_MEDIA_LISTEN_IP;
    const workers = Number(env.MEDIA_WORKERS ?? DEFAULT_MEDIA_WORKERS);
    return {
        enabled: workers > 0,
        options: {
            listenIp,
            listenPort: parsePort(
                env.MEDIA_LISTEN_PORT,
                DEFAULT_MEDIA_LISTEN_PORT
            ),
            announcedAddress: env.MEDIA_ANNOUNCED_ADDRESS || undefined,
            logLevel: "warn",
        },
    };
};
