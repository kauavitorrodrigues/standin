import {
    SPACE_EVENT_RADIUS_PX,
    type SpaceAnnouncer,
    type SpaceAnnouncersPayload,
} from "@standin/contracts";
import { PresenceStore } from "../presence/PresenceStore";
import { RoomStates } from "../utils/roomStates";
import { SpaceInterests } from "./SpaceInterests";
import type { AnnouncersSender } from "./types";

// What each socket was last told, so a socket is written to only when its
// list changed, and so a change can find the sockets that still hold a person
// who stopped, left or walked away.
const lastSent = new Map<string, SpaceAnnouncer[]>();

const signatureOf = (announcers: SpaceAnnouncer[]): string =>
    announcers
        .map(
            ({ socketId, announcingSince }) => `${socketId}:${announcingSince}`
        )
        .join("|");

// Who the socket hears: the announcers within earshot of it and in the same
// private rooms, the oldest first. The list is display-ready, so the client
// does not sort or filter it.
const listFor = (spaceId: string, socketId: string): SpaceAnnouncer[] => {
    const announcers = PresenceStore.listAnnouncers(spaceId).filter(
        (entry) => entry.socketId !== socketId
    );
    if (announcers.length === 0) return [];

    const near = new Set(
        SpaceInterests.neighbors(spaceId, socketId, SPACE_EVENT_RADIUS_PX)
    );
    return announcers
        .filter(
            (entry) =>
                near.has(entry.socketId) &&
                RoomStates.sameRooms(spaceId, socketId, entry.socketId)
        )
        .map(({ socketId: id, userId, announcingSince }) => ({
            socketId: id,
            userId,
            announcingSince: announcingSince ?? 0,
        }));
};

const refresh = (
    spaceId: string,
    socketId: string,
    send: AnnouncersSender
): void => {
    const next = listFor(spaceId, socketId);
    const previous = lastSent.get(socketId) ?? [];
    if (signatureOf(next) === signatureOf(previous)) return;

    if (next.length === 0) lastSent.delete(socketId);
    else lastSent.set(socketId, next);
    send(socketId, { announcers: next } satisfies SpaceAnnouncersPayload);
};

const holders = (announcerSocketId: string): string[] =>
    [...lastSent.entries()]
        .filter(([, list]) =>
            list.some((entry) => entry.socketId === announcerSocketId)
        )
        .map(([socketId]) => socketId);

// Tells everyone who may have to change their list because of this socket: the
// ones near it now and the ones that still hold it from before. A socket that
// is not announcing and that nobody holds costs nothing.
const refreshAround = (
    spaceId: string,
    announcerSocketId: string,
    send: AnnouncersSender
): void => {
    const targets = new Set([
        ...SpaceInterests.neighbors(
            spaceId,
            announcerSocketId,
            SPACE_EVENT_RADIUS_PX
        ),
        ...holders(announcerSocketId),
    ]);
    targets.delete(announcerSocketId);
    targets.forEach((socketId) => refresh(spaceId, socketId, send));
};

// For a socket that moved or crossed a door: its own list may change, and so
// may the list of whoever it announces to. Does nothing while the space has no
// announcer and the socket holds none, which is almost always.
const refreshOnMove = (
    spaceId: string,
    socketId: string,
    send: AnnouncersSender
): void => {
    const announces =
        PresenceStore.get(spaceId, socketId)?.announcingSince != null;
    const hasAnnouncers = PresenceStore.listAnnouncers(spaceId).length > 0;
    if (!hasAnnouncers && !lastSent.has(socketId)) return;

    refresh(spaceId, socketId, send);
    if (announces) refreshAround(spaceId, socketId, send);
};

// A socket that went away holds nothing, and nobody should keep holding it.
const forget = (spaceId: string, socketId: string, send: AnnouncersSender) => {
    lastSent.delete(socketId);
    holders(socketId).forEach((holderId) => refresh(spaceId, holderId, send));
};

const clear = (): void => lastSent.clear();

export const AnnouncerSync = {
    refresh,
    refreshAround,
    refreshOnMove,
    forget,
    clear,
};
