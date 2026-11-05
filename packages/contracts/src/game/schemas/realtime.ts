import { z } from "zod/v4";
import { PLAYER_DIRECTIONS } from "../enums/player";
import {
    EMOTE_COMBO_MAX,
    EMOTE_COMBO_MIN,
    EMOTE_MAX_LENGTH,
} from "../consts/emote";
import { NEARBY_MESSAGE_RECEIVE_MAX_LENGTH } from "../consts/nearby-message";
import { SPACE_MAX_COORDINATE_PX } from "../consts/realtime";
import { GameErrorMessages } from "./consts/error-messages";

const coordinate = z
    .number({ error: GameErrorMessages.position.coordinate.invalid })
    .finite({ error: GameErrorMessages.position.coordinate.invalid })
    .min(0, { error: GameErrorMessages.position.coordinate.invalid })
    .max(SPACE_MAX_COORDINATE_PX, {
        error: GameErrorMessages.position.coordinate.invalid,
    });

// Where the avatar of the person is. Sent only when it changed.
export const SpacePositionSchema = z.object({
    x: coordinate,
    y: coordinate,
    direction: z.enum(Object.values(PLAYER_DIRECTIONS), {
        error: GameErrorMessages.position.direction.invalid,
    }),
    isSitting: z.boolean({
        error: GameErrorMessages.position.isSitting.invalid,
    }),
    // Left out by a client that does not dance, which reads as not dancing.
    isDancing: z
        .boolean({ error: GameErrorMessages.position.isDancing.invalid })
        .default(false),
});

export const SpaceEmoteSchema = z.object({
    emoji: z
        .string({ error: GameErrorMessages.emote.emoji.invalid })
        .min(1, { error: GameErrorMessages.emote.emoji.invalid })
        .max(EMOTE_MAX_LENGTH, { error: GameErrorMessages.emote.emoji.invalid }),
    count: z
        .number({ error: GameErrorMessages.emote.count.invalid })
        .int({ error: GameErrorMessages.emote.count.invalid })
        .min(EMOTE_COMBO_MIN, { error: GameErrorMessages.emote.count.invalid })
        .max(EMOTE_COMBO_MAX, { error: GameErrorMessages.emote.count.invalid }),
});

// Confetti carries nothing: the burst starts at the sender, and who sent it is
// stamped by the server.
export const SpaceConfettiSchema = z.object({});

export const SpaceNearbyMessageSchema = z.object({
    text: z
        .string({ error: GameErrorMessages.nearby.text.invalid })
        .min(1, { error: GameErrorMessages.nearby.text.invalid })
        .max(NEARBY_MESSAGE_RECEIVE_MAX_LENGTH, {
            error: GameErrorMessages.nearby.text.invalid,
        }),
});

export const SpaceNearbyTypingSchema = z.object({
    isTyping: z.boolean({ error: GameErrorMessages.nearby.isTyping.invalid }),
});

export const SpaceSetAnnouncingSchema = z.object({
    announcing: z.boolean({
        error: GameErrorMessages.announcing.announcing.invalid,
    }),
});

export const SpaceShareVideoWithAnnouncerSchema = z.object({
    sharing: z.boolean({
        error: GameErrorMessages.shareVideo.sharing.invalid,
    }),
});

export const SpaceSetHandRaisedSchema = z.object({
    raised: z.boolean({
        error: GameErrorMessages.handRaise.raised.invalid,
    }),
});
