import { z } from "zod/v4";
import { PLAYER_DIRECTIONS } from "../enums/player";
import { ANNOUNCEABLE_AVAILABILITIES } from "../enums/availability";
import { CUSTOM_STATUS } from "../consts/custom-status";
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
        .max(EMOTE_MAX_LENGTH, {
            error: GameErrorMessages.emote.emoji.invalid,
        }),
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

const EMOJI_PATTERN = /[\p{Extended_Pictographic}\p{Regional_Indicator}]/u;

// One emoji is one grapheme, so a flag or a family counts once.
const isSingleEmoji = (value: string): boolean => {
    const graphemes = [...new Intl.Segmenter().segment(value)];
    return graphemes.length === 1 && EMOJI_PATTERN.test(value);
};

// What the person is up to: a short text with an emoji and, optionally, the
// moment it stops being shown (ms since the epoch). The time is checked when
// the status arrives, so one that already ended is refused, with a little room
// for the difference between the clocks.
export const CustomStatusSchema = z.object({
    text: z
        .string({ error: GameErrorMessages.status.text.invalid })
        .trim()
        .min(1, { error: GameErrorMessages.status.text.invalid })
        .max(CUSTOM_STATUS.textMaxLength, {
            error: GameErrorMessages.status.text.invalid,
        }),
    emoji: z
        .string({ error: GameErrorMessages.status.emoji.invalid })
        .max(CUSTOM_STATUS.emojiMaxLength, {
            error: GameErrorMessages.status.emoji.invalid,
        })
        .refine(isSingleEmoji, {
            error: GameErrorMessages.status.emoji.invalid,
        }),
    expiresAt: z
        .number({ error: GameErrorMessages.status.expiresAt.invalid })
        .int({ error: GameErrorMessages.status.expiresAt.invalid })
        .refine(
            (value) =>
                value > Date.now() - CUSTOM_STATUS.pastToleranceMs &&
                value <=
                    Date.now() +
                        CUSTOM_STATUS.maxDurationMs +
                        CUSTOM_STATUS.clockToleranceMs,
            { error: GameErrorMessages.status.expiresAt.invalid }
        )
        .nullable(),
});

// The status of the person: away or active, and the custom status or null to
// clear it. Always the whole status, so a request replaces the previous one.
export const SpaceSetStatusSchema = z.object({
    availability: z.enum(ANNOUNCEABLE_AVAILABILITIES, {
        error: GameErrorMessages.status.availability.invalid,
    }),
    customStatus: CustomStatusSchema.nullable(),
});

// The object the person has open, or null when they closed it. The server
// checks that it is a website object of the map of the space.
export const SpaceSetActiveObjectSchema = z.object({
    objectId: z
        .string({ error: GameErrorMessages.activeObject.objectId.invalid })
        .min(1, { error: GameErrorMessages.activeObject.objectId.invalid })
        .max(64, { error: GameErrorMessages.activeObject.objectId.invalid })
        .nullable(),
});

export const SpaceCloseObjectForViewersSchema = z.object({
    objectId: z
        .string({ error: GameErrorMessages.closeObject.objectId.invalid })
        .min(1, { error: GameErrorMessages.closeObject.objectId.invalid })
        .max(64, { error: GameErrorMessages.closeObject.objectId.invalid }),
});
