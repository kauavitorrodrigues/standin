import {
    MEDIA_SOURCE_KINDS,
    type MediaConsumerNewPayload,
} from "@standin/contracts";
import { SOURCE_OF_PLANNER_KIND } from "../../consts/spaceMedia";
import type { ConsumerEntry } from "../spaceTypes";

export const toConsumerNewPayload = (
    entry: ConsumerEntry,
    userId: string
): MediaConsumerNewPayload => {
    const source = SOURCE_OF_PLANNER_KIND[entry.kind];
    return {
        consumerId: entry.consumer.id,
        producerId: entry.producerId,
        userId,
        source,
        kind: MEDIA_SOURCE_KINDS[source],
        rtpParameters: entry.consumer.rtpParameters as unknown as Record<
            string,
            unknown
        >,
    };
};
