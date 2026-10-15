import type { Server, Socket } from "socket.io";
import { RoomEvents, RoomJoinAnswerSchema } from "@standin/contracts";
import { RoomStates } from "../utils/roomStates";
import { sendEntitlements } from "../utils/applyJoinEffects";

export function registerRoomJoinAnswer(io: Server, socket: Socket) {
    socket.on(RoomEvents.ROOM_JOIN_ANSWER, (payload) => {
        try {
            const { spaceId } = socket.data;
            if (!spaceId) return;

            const parsed = RoomJoinAnswerSchema.safeParse(payload);
            if (!parsed.success) return;

            const { roomKey, userId, accept } = parsed.data;
            const answered = RoomStates.answerJoin(
                spaceId,
                roomKey,
                socket.id,
                userId,
                accept
            );
            if (!answered) return;

            // Only the first answer counts, so the card goes away for all.
            answered.notify.forEach((socketId) => {
                io.to(socketId).emit(RoomEvents.ROOM_JOIN_CANCELLED, {
                    roomKey,
                    userId,
                });
            });

            const decision = { roomKey, accepted: accept };
            io.to(answered.requesterSocketId).emit(
                RoomEvents.ROOM_JOIN_DECISION,
                decision
            );
            if (accept) sendEntitlements(io.sockets.sockets, spaceId, userId);
        } catch (error) {
            console.error(error);
        }
    });
}
