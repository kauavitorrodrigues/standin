import { z } from "zod/v4";
import { GameErrorMessages } from "./consts/error-messages";

// Only the space. Who joins comes from the token of the socket and the
// organization from the space itself, never from what the client sends.
export const SpaceJoinSchema = z.object({
    spaceId: z
        .string({ error: GameErrorMessages.spaceJoin.spaceId.required })
        .min(1, { error: GameErrorMessages.spaceJoin.spaceId.required }),
});

export const MapJoinSchema = z.object({
    mapId: z
        .string({ error: GameErrorMessages.mapJoin.mapId.required })
        .min(1, { error: GameErrorMessages.mapJoin.mapId.required }),
});
