import type { Desk, DeskStatus } from "../types/desk";

export const resolveDeskStatus = (
    desks: readonly Desk[],
    mapAssetId: string,
    userId: string
): DeskStatus => {
    const owner = desks.find((desk) => desk.mapAssetId === mapAssetId);
    if (!owner) return { kind: "free" };
    if (owner.userId === userId) return { kind: "mine" };
    return { kind: "taken", ownerId: owner.userId };
};
