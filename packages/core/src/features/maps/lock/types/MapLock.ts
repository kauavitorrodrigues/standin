import type { EditScopeKind, PublishResult } from "@standin/contracts";

export type MapLockPublish = { publishId: string; result: PublishResult };

export type MapLock = {
    mapId: string;
    userId: string;
    userName: string;
    sessionId: string;
    // map: the Studio, objects: the decorator.
    mode: EditScopeKind;
    acquiredAt: number;
    lastHeartbeatAt: number;
    lastPublish?: MapLockPublish;
};
