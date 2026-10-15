import { BaseError } from "../../errors/base";

const LOCK_STATUS = 423;

export type MapLockHolder = { id: string; name: string };

// 423: someone else is editing the map, so every write is refused.
export class MapLockedError extends BaseError {
    public readonly by: MapLockHolder;
    public readonly since: string;

    constructor(by: MapLockHolder, since: string) {
        super("Map is locked by another editor.", "MAP_LOCKED", LOCK_STATUS);
        this.by = by;
        this.since = since;
    }
}

// 423: the editor session no longer holds the lock.
export class LockNotHeldError extends BaseError {
    constructor() {
        super(
            "Editor session does not hold the map lock.",
            "LOCK_NOT_HELD",
            LOCK_STATUS
        );
    }
}
