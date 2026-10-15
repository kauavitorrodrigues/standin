import type { PublishResult } from "@standin/contracts";

export type MapLockPublish = { publishId: string; result: PublishResult };

export type MapLock = {
    mapId: string;
    userId: string;
    userName: string;
    sessionId: string;
    acquiredAt: number;
    lastHeartbeatAt: number;
    lastPublish?: MapLockPublish;
};
