import { z } from "zod/v4";
import {
    MEDIA_SOURCES,
    MEDIA_TRANSPORT_DIRECTIONS,
} from "../enums/media-source";
import { MediaErrorMessages } from "./error-messages";

export * from "./error-messages";

const transportId = z
    .string({ error: MediaErrorMessages.transport.id.required })
    .min(1, { error: MediaErrorMessages.transport.id.required })
    .max(64, { error: MediaErrorMessages.transport.id.required });

const producerId = z
    .string({ error: MediaErrorMessages.producer.id.required })
    .min(1, { error: MediaErrorMessages.producer.id.required })
    .max(64, { error: MediaErrorMessages.producer.id.required });

const consumerId = z
    .string({ error: MediaErrorMessages.consumer.id.required })
    .min(1, { error: MediaErrorMessages.consumer.id.required })
    .max(64, { error: MediaErrorMessages.consumer.id.required });

// The parameters are produced by the media library of the browser and read by
// the media worker, which validates them again. Here only the outer shape is
// checked, so a client cannot send anything but an object.
const parameters = (message: string) =>
    z.record(z.string(), z.unknown(), { error: message });

// The receive transport carries the capabilities of the device of the browser,
// which the server needs to build a consumer it can decode.
export const MediaCreateTransportSchema = z
    .object({
        direction: z.enum(Object.values(MEDIA_TRANSPORT_DIRECTIONS), {
            error: MediaErrorMessages.transport.direction.invalid,
        }),
        rtpCapabilities: parameters(
            MediaErrorMessages.transport.rtpCapabilities.invalid
        ).optional(),
    })
    .refine(
        (value) =>
            value.direction !== "recv" || value.rtpCapabilities !== undefined,
        { error: MediaErrorMessages.transport.rtpCapabilities.invalid }
    );

export const MediaConnectTransportSchema = z.object({
    transportId,
    dtlsParameters: parameters(
        MediaErrorMessages.transport.dtlsParameters.invalid
    ),
});

// Asks for new ICE parameters of one of the transports of the person, to
// recover a connection that dropped without building the session again.
export const MediaRestartIceSchema = z.object({ transportId });

export const MediaProduceSchema = z.object({
    transportId,
    source: z.enum(Object.values(MEDIA_SOURCES), {
        error: MediaErrorMessages.produce.source.invalid,
    }),
    rtpParameters: parameters(MediaErrorMessages.produce.rtpParameters.invalid),
});

export const MediaCloseProducerSchema = z.object({ producerId });

export const MediaConsumerReadySchema = z.object({ consumerId });

// The camera layers a receiver can ask for, from the smallest to the sharpest.
export const MEDIA_VIEW_LAYERS = ["low", "mid", "high"] as const;

// The cameras the receiver shows in a tile big enough to need more than the
// low layer, each with the layer the tile size calls for. A person that is not
// listed is received in the low layer. An empty list clears the views.
export const MAX_MEDIA_VIEWS = 8;

export const MediaSetFocusSchema = z.object({
    views: z
        .array(
            z.object({
                userId: z
                    .string({ error: MediaErrorMessages.focus.userId.invalid })
                    .min(1, { error: MediaErrorMessages.focus.userId.invalid })
                    .max(64, { error: MediaErrorMessages.focus.userId.invalid }),
                layer: z.enum(MEDIA_VIEW_LAYERS, {
                    error: MediaErrorMessages.focus.layer.invalid,
                }),
            }),
            { error: MediaErrorMessages.focus.invalid }
        )
        .max(MAX_MEDIA_VIEWS, { error: MediaErrorMessages.focus.invalid }),
});

// The people the receiver pinned on the stage, in pin order, who keep a video
// slot while they are close enough.
export const MAX_MEDIA_PINS = 2;

export const MediaSetPinsSchema = z.object({
    userIds: z
        .array(
            z
                .string({ error: MediaErrorMessages.pins.userId.invalid })
                .min(1, { error: MediaErrorMessages.pins.userId.invalid })
                .max(64, { error: MediaErrorMessages.pins.userId.invalid }),
            { error: MediaErrorMessages.pins.invalid }
        )
        .max(MAX_MEDIA_PINS, { error: MediaErrorMessages.pins.invalid }),
});

// The people whose video the receiver hid, as the full list. Their audio is not
// touched. A person drops out of the list by itself when they leave the reach
// of the video, and the server tells the client.
export const MAX_MEDIA_HIDDEN_VIDEOS = 16;

export const MediaSetHiddenVideoSchema = z.object({
    userIds: z
        .array(
            z
                .string({
                    error: MediaErrorMessages.hiddenVideo.userId.invalid,
                })
                .min(1, { error: MediaErrorMessages.hiddenVideo.userId.invalid })
                .max(64, {
                    error: MediaErrorMessages.hiddenVideo.userId.invalid,
                }),
            { error: MediaErrorMessages.hiddenVideo.invalid }
        )
        .max(MAX_MEDIA_HIDDEN_VIDEOS, {
            error: MediaErrorMessages.hiddenVideo.invalid,
        }),
});

// A weak machine asks for the low layer and fewer streams.
export const MediaSetLowQualitySchema = z.object({
    enabled: z.boolean({
        error: MediaErrorMessages.lowQuality.enabled.invalid,
    }),
});

export const MediaSetMutedSchema = z.object({
    muted: z.boolean({ error: MediaErrorMessages.muted.invalid }),
});

// The privacy modes of a person. Headphones cut every connection in both
// directions, focus is stored and shown to the others.
export const MediaSetPrivacySchema = z.object({
    headphones: z.boolean({
        error: MediaErrorMessages.privacy.headphones.invalid,
    }),
    focus: z.boolean({ error: MediaErrorMessages.privacy.focus.invalid }),
});
