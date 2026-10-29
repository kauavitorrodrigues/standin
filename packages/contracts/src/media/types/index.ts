import type { z } from "zod/v4";
import type {
    MediaCloseProducerSchema,
    MediaConnectTransportSchema,
    MediaConsumerReadySchema,
    MediaCreateTransportSchema,
    MediaProduceSchema,
    MediaRestartIceSchema,
    MediaSetFocusSchema,
    MediaSetHiddenVideoSchema,
    MediaSetLowQualitySchema,
    MediaSetMutedSchema,
    MediaSetPinsSchema,
    MediaSetPrivacySchema,
} from "../schemas";
import type { MediaKind, MediaSource } from "../enums/media-source";
import type { MediaPauseReason } from "../enums/media-pause-reason";

export type MediaCreateTransportInput = z.infer<
    typeof MediaCreateTransportSchema
>;
export type MediaConnectTransportInput = z.infer<
    typeof MediaConnectTransportSchema
>;
export type MediaRestartIceInput = z.infer<typeof MediaRestartIceSchema>;
export type MediaProduceInput = z.infer<typeof MediaProduceSchema>;
export type MediaCloseProducerInput = z.infer<typeof MediaCloseProducerSchema>;
export type MediaConsumerReadyInput = z.infer<typeof MediaConsumerReadySchema>;
export type MediaSetFocusInput = z.infer<typeof MediaSetFocusSchema>;
export type MediaSetPinsInput = z.infer<typeof MediaSetPinsSchema>;
export type MediaSetHiddenVideoInput = z.infer<typeof MediaSetHiddenVideoSchema>;
export type MediaSetLowQualityInput = z.infer<typeof MediaSetLowQualitySchema>;
export type MediaSetMutedInput = z.infer<typeof MediaSetMutedSchema>;
export type MediaSetPrivacyInput = z.infer<typeof MediaSetPrivacySchema>;

export type MediaAckFailure = { ok: false; code: string };

export type MediaCapabilitiesAck =
    { ok: true; rtpCapabilities: Record<string, unknown> } | MediaAckFailure;

export type MediaCreateTransportAck =
    | {
          ok: true;
          transportId: string;
          iceParameters: Record<string, unknown>;
          iceCandidates: Record<string, unknown>[];
          dtlsParameters: Record<string, unknown>;
      }
    | MediaAckFailure;

export type MediaRestartIceAck =
    | { ok: true; iceParameters: Record<string, unknown> }
    | MediaAckFailure;

export type MediaOkAck = { ok: true } | MediaAckFailure;

export type MediaProduceAck =
    { ok: true; producerId: string } | MediaAckFailure;

// A stream the server created for this person. The client plays it.
export type MediaConsumerNewPayload = {
    consumerId: string;
    producerId: string;
    userId: string;
    source: MediaSource;
    kind: MediaKind;
    rtpParameters: Record<string, unknown>;
};

// Whether anybody is receiving a stream this person sends. When nobody is, the
// browser stops encoding it, and starts again when someone comes near.
export type MediaProducerDemandPayload = {
    source: MediaSource;
    wanted: boolean;
};

export type MediaConsumerClosedPayload = { consumerId: string };

// A stream the server holds back, or lets flow again, with the reason. The
// consumer stays, so a stream that comes back plays at once.
export type MediaConsumerPausedPayload = {
    consumerId: string;
    reason: MediaPauseReason;
};
export type MediaConsumerResumedPayload = MediaConsumerPausedPayload;

// The people whose video this person hid, after the server dropped some of
// them because they went out of the reach of the video.
export type MediaHiddenVideoChangedPayload = { userIds: string[] };

// Loudest first, user ids.
export type MediaSpeakersPayload = { userIds: string[] };

export type MediaStateChangedPayload = { userId: string; muted: boolean };

// The privacy modes of a person, told to the others in the space.
export type MediaPrivacyChangedPayload = {
    userId: string;
    headphones: boolean;
    focus: boolean;
};
