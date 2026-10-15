import { createMapLockService } from "./createMapLockService";
import { toLockState } from "./utils/toLockState";

export type {
    AcquireDenied,
    AcquireGranted,
    AcquireResult,
} from "./types/acquire-result";
export type { MapLock, MapLockPublish } from "./types/MapLock";
export type { LockUser } from "./types/lock-user";

const lockService = createMapLockService();

export const MapLockService = {
    ...lockService,
    // The public shape of the lock of a map: who holds it and since when.
    getState: (mapId: string) => toLockState(lockService.get(mapId)),
};
