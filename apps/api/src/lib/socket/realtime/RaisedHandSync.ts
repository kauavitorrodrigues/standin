import {
    SPACE_EVENT_RADIUS_PX,
    type SpaceRaisedHand,
    type SpaceRaisedHandsPayload,
} from "@standin/contracts";
import { PresenceStore } from "../presence/PresenceStore";
import { RoomStates } from "../utils/roomStates";
import { SpaceInterests } from "./SpaceInterests";
import type { RaisedHandsSender } from "./types";

// What each socket was last told, so a socket is written to only when its
// list changed, and so a change can find the sockets that still hold a hand
// that went down, left or walked away.
const lastSent = new Map<string, SpaceRaisedHand[]>();

const signatureOf = (hands: SpaceRaisedHand[]): string =>
    hands
        .map(({ socketId, raisedSince }) => `${socketId}:${raisedSince}`)
        .join("|");

// The hands the socket sees: the ones within earshot of it and in the same
// private rooms, the oldest first. The list is display-ready, so the client
// does not sort or filter it.
const listFor = (spaceId: string, socketId: string): SpaceRaisedHand[] => {
    const hands = PresenceStore.listRaisedHands(spaceId).filter(
        (entry) => entry.socketId !== socketId
    );
    if (hands.length === 0) return [];

    const near = new Set(
        SpaceInterests.neighbors(spaceId, socketId, SPACE_EVENT_RADIUS_PX)
    );
    return hands
        .filter(
            (entry) =>
                near.has(entry.socketId) &&
                RoomStates.sameRooms(spaceId, socketId, entry.socketId)
        )
        .map(({ socketId: id, userId, handRaisedSince }) => ({
            socketId: id,
            userId,
            raisedSince: handRaisedSince ?? 0,
        }));
};

const refresh = (
    spaceId: string,
    socketId: string,
    send: RaisedHandsSender
): void => {
    const next = listFor(spaceId, socketId);
    const previous = lastSent.get(socketId) ?? [];
    if (signatureOf(next) === signatureOf(previous)) return;

    lastSent.delete(socketId);
    if (next.length > 0) lastSent.set(socketId, next);
    send(socketId, { hands: next } satisfies SpaceRaisedHandsPayload);
};

const holders = (handSocketId: string): string[] =>
    [...lastSent.entries()]
        .filter(([, list]) =>
            list.some((entry) => entry.socketId === handSocketId)
        )
        .map(([socketId]) => socketId);

// Tells everyone who may have to change their list because of this socket: the
// ones near it now and the ones that still hold it from before.
const refreshAround = (
    spaceId: string,
    handSocketId: string,
    send: RaisedHandsSender
): void => {
    const targets = new Set([
        ...SpaceInterests.neighbors(
            spaceId,
            handSocketId,
            SPACE_EVENT_RADIUS_PX
        ),
        ...holders(handSocketId),
    ]);
    targets.delete(handSocketId);
    targets.forEach((socketId) => refresh(spaceId, socketId, send));
};

// For a socket that moved or crossed a door: its own list may change, and so
// may the list of whoever sees its hand. Does nothing while the space has no
// raised hand and the socket holds none, which is almost always.
const refreshOnMove = (
    spaceId: string,
    socketId: string,
    send: RaisedHandsSender
): void => {
    const raised =
        PresenceStore.get(spaceId, socketId)?.handRaisedSince != null;
    const hasHands = PresenceStore.listRaisedHands(spaceId).length > 0;
    if (!hasHands && !lastSent.has(socketId)) return;

    refresh(spaceId, socketId, send);
    if (raised) refreshAround(spaceId, socketId, send);
};

// A socket that went away holds nothing, and nobody should keep holding it.
const forget = (spaceId: string, socketId: string, send: RaisedHandsSender) => {
    lastSent.delete(socketId);
    holders(socketId).forEach((holderId) => refresh(spaceId, holderId, send));
};

const clear = (): void => lastSent.clear();

export const RaisedHandSync = {
    refresh,
    refreshAround,
    refreshOnMove,
    forget,
    clear,
};
