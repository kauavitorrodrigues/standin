import { z } from "zod/v4";
import { ROOM_CROSS_DIRECTIONS } from "../enums/room";
import { GameErrorMessages } from "./consts/error-messages";

const roomKey = z
    .string({ error: GameErrorMessages.room.roomKey.required })
    .min(1, { error: GameErrorMessages.room.roomKey.required });

export const RoomCrossedSchema = z.object({
    roomKey,
    direction: z.enum(
        [ROOM_CROSS_DIRECTIONS.IN, ROOM_CROSS_DIRECTIONS.OUT],
        { error: GameErrorMessages.room.direction.invalid }
    ),
});

// Stepping on the cell of a closed door.
export const RoomOpenSchema = z.object({ roomKey });
// Tells the server the avatar is already inside the room, with no change.
export const RoomPresentSchema = z.object({ roomKey });
export const RoomLockSchema = z.object({ roomKey });
export const RoomUnlockSchema = z.object({ roomKey });

// Someone outside a locked room asks the people inside to let them in.
export const RoomJoinRequestSchema = z.object({ roomKey });

// Someone inside answers the request of `userId`.
export const RoomJoinAnswerSchema = z.object({
    roomKey,
    userId: z
        .string({ error: GameErrorMessages.room.userId.required })
        .min(1, { error: GameErrorMessages.room.userId.required }),
    accept: z.boolean({ error: GameErrorMessages.room.accept.invalid }),
});
