import { z } from "zod/v4";
import { GameErrorMessages } from "./consts/error-messages";

export const SpaceJoinSchema = z.object({
    organizationId: z
        .string({ error: GameErrorMessages.spaceJoin.organizationId.required })
        .min(1, { error: GameErrorMessages.spaceJoin.organizationId.required }),
    spaceId: z
        .string({ error: GameErrorMessages.spaceJoin.spaceId.required })
        .min(1, { error: GameErrorMessages.spaceJoin.spaceId.required }),
    userId: z
        .string({ error: GameErrorMessages.spaceJoin.userId.required })
        .min(1, { error: GameErrorMessages.spaceJoin.userId.required }),
});

export const WebrtcSignalSchema = z.object({
    targetSocketId: z
        .string({
            error: GameErrorMessages.webrtcSignal.targetSocketId.required,
        })
        .min(1, {
            error: GameErrorMessages.webrtcSignal.targetSocketId.required,
        }),
    signal: z.unknown(),
});
