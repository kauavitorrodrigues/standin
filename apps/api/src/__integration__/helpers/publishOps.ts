import type { EditorOp, User } from "@standin/contracts";
import type { MapAccess } from "@standin/core";

type Core = typeof import("@standin/core");
type Actor = Pick<User, "id"> & { name: string };

const SESSION = "integration-publish-session";

// Publishes through the service as the person holding the lock, which is how
// the editor changes a layout. Nothing here is a test double: the lock, the
// replay and the diff are the real ones.
export const publishRaw = (
    core: Core,
    actor: Actor,
    access: MapAccess,
    baseVersion: number,
    ops: EditorOp[]
) =>
    core.MapPublishService.publish(actor, access, SESSION, {
        publishId: crypto.randomUUID(),
        baseVersion,
        ops,
    });

// Takes the lock, publishes once and lets the lock go, so the other routes
// of the same map stay writable for the rest of the test.
export const publishOps = async (
    core: Core,
    actor: Actor,
    access: MapAccess,
    baseVersion: number,
    ops: EditorOp[]
) => {
    const lock = core.MapLockService.acquire(access.mapId, actor, SESSION);
    if (!lock.ok) throw new Error("The test map is locked by someone else.");

    try {
        const { result } = await publishRaw(
            core,
            actor,
            access,
            baseVersion,
            ops
        );
        return result;
    } finally {
        core.MapLockService.release(access.mapId, SESSION);
    }
};
