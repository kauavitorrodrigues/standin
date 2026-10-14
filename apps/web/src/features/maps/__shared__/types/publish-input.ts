import type { PublishRequest } from "@standin/contracts";

export type PublishInput = PublishRequest & {
    mapId: string;
    sessionId: string;
};
