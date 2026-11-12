import type { Server, Socket } from "socket.io";
import {
    SPACE_EVENT_RADIUS_PX,
    SpaceConfettiSchema,
    SpaceEmoteSchema,
    SpaceEvents,
    SpaceNearbyMessageSchema,
    SpaceNearbyTypingSchema,
    SpaceWaveSchema,
} from "@standin/contracts";
import { PresenceStore } from "../presence/PresenceStore";
import { RoomStates } from "../utils/roomStates";
import { SpaceInterests } from "../realtime/SpaceInterests";
import { resolveSpaceSettings } from "../services/resolveSpaceSettings";

type Relayable =
    | typeof SpaceEvents.SPACE_EMOTE
    | typeof SpaceEvents.SPACE_CONFETTI
    | typeof SpaceEvents.SPACE_NEARBY_MESSAGE
    | typeof SpaceEvents.SPACE_NEARBY_TYPING;

// Sends the event to the people near the sender who are in the same private
// rooms, and to nobody else. The sender is stamped from the socket the event
// came on. The receivers still decide by themselves whether to show it, since
// the range is measured on their side as well.
const relayNearby = (
    io: Server,
    socket: Socket,
    event: Relayable,
    body: Record<string, unknown>
) => {
    const { spaceId } = socket.data;
    if (!spaceId) return;

    const receivers = SpaceInterests.neighbors(
        spaceId,
        socket.id,
        SPACE_EVENT_RADIUS_PX
    ).filter((socketId) => RoomStates.sameRooms(spaceId, socket.id, socketId));
    if (receivers.length === 0) return;

    // One call, so the packet is encoded once however many hear it.
    io.to(receivers).emit(event, { socketId: socket.id, ...body });
};

// A wave reaches one person, and only while they are online in the space, near
// the sender and in the same private rooms. Anything else is dropped without an
// answer, so a wave cannot tell who is online or where they stand.
const relayWave = (io: Server, socket: Socket, targetUserId: string) => {
    const { spaceId, userId } = socket.data;
    if (!spaceId) return;
    if (targetUserId === userId) return;

    const near = new Set(
        SpaceInterests.neighbors(spaceId, socket.id, SPACE_EVENT_RADIUS_PX)
    );
    const receivers = PresenceStore.findSocketIdsOfUser(
        spaceId,
        targetUserId
    ).filter(
        (socketId) =>
            near.has(socketId) &&
            RoomStates.sameRooms(spaceId, socket.id, socketId)
    );
    if (receivers.length === 0) return;

    io.to(receivers).emit(SpaceEvents.SPACE_WAVE, { socketId: socket.id });
};

const isDancing = (socket: Socket): boolean => {
    const { spaceId } = socket.data;
    if (!spaceId) return false;

    return SpaceInterests.get(spaceId, socket.id)?.isDancing === true;
};

// Relays a nearby event unless the space turned it off. A rejected event is
// dropped, since nobody waits for an answer to it.
const relayIfSendNearbyEnabled = async (
    io: Server,
    socket: Socket,
    event: Relayable,
    body: Record<string, unknown>
) => {
    const { spaceId } = socket.data;
    if (!spaceId) return;

    try {
        // With enableSendNearbyInMapView false the command is hidden and the
        // event is refused.
        const settings = await resolveSpaceSettings(spaceId);
        if (!settings.enableSendNearbyInMapView) return;
    } catch (error) {
        console.error(error);
        return;
    }

    relayNearby(io, socket, event, body);
};

export function registerSpaceEvents(io: Server, socket: Socket) {
    socket.on(SpaceEvents.SPACE_EMOTE, (payload) => {
        const parsed = SpaceEmoteSchema.safeParse(payload);
        if (!parsed.success) return;
        // A person who dances makes no other gesture.
        if (isDancing(socket)) return;

        relayNearby(io, socket, SpaceEvents.SPACE_EMOTE, parsed.data);
    });

    socket.on(SpaceEvents.SPACE_CONFETTI, (payload) => {
        const parsed = SpaceConfettiSchema.safeParse(payload);
        if (!parsed.success) return;

        relayNearby(io, socket, SpaceEvents.SPACE_CONFETTI, parsed.data);
    });

    socket.on(SpaceEvents.SPACE_WAVE, (payload) => {
        const parsed = SpaceWaveSchema.safeParse(payload);
        if (!parsed.success) return;
        // A person who dances makes no other gesture.
        if (isDancing(socket)) return;

        relayWave(io, socket, parsed.data.targetUserId);
    });

    socket.on(SpaceEvents.SPACE_NEARBY_MESSAGE, (payload) => {
        const parsed = SpaceNearbyMessageSchema.safeParse(payload);
        if (!parsed.success) return;

        void relayIfSendNearbyEnabled(
            io,
            socket,
            SpaceEvents.SPACE_NEARBY_MESSAGE,
            parsed.data
        );
    });

    socket.on(SpaceEvents.SPACE_NEARBY_TYPING, (payload) => {
        const parsed = SpaceNearbyTypingSchema.safeParse(payload);
        if (!parsed.success) return;

        void relayIfSendNearbyEnabled(
            io,
            socket,
            SpaceEvents.SPACE_NEARBY_TYPING,
            parsed.data
        );
    });
}
