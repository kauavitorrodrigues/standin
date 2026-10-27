import type { Server, Socket } from "socket.io";
import {
    SPACE_EVENT_RADIUS_PX,
    SpaceEmoteSchema,
    SpaceEvents,
    SpaceNearbyMessageSchema,
    SpaceNearbyTypingSchema,
} from "@standin/contracts";
import { RoomStates } from "../utils/roomStates";
import { SpaceInterests } from "../realtime/SpaceInterests";
import { resolveSpaceSettings } from "../services/resolveSpaceSettings";

type Relayable =
    | typeof SpaceEvents.SPACE_EMOTE
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

        relayNearby(io, socket, SpaceEvents.SPACE_EMOTE, parsed.data);
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
