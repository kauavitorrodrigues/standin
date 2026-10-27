import type { types } from "mediasoup";
import { SPATIAL_LAYER } from "../../consts/spaceMedia";
import type { ProducerKind, SimulcastLayer } from "../../planner/types";
import type { ConsumerEntry, Peer } from "../spaceTypes";
import type { MediaNotifier } from "../types";

/*
 * Each function here changes one consumer of one peer. They know nothing of
 * the room, so the class only decides which of them to call.
 */

export const closeConsumer = (
    peer: Peer,
    producerId: string,
    notifier: MediaNotifier
): void => {
    const entry = peer.consumers.get(producerId);
    if (!entry) return;

    peer.consumers.delete(producerId);
    entry.consumer.close();
    notifier.consumerClosed(peer.id, { consumerId: entry.consumer.id });
};

export const setConsumerPaused = async (
    peer: Peer,
    producerId: string,
    paused: boolean
): Promise<void> => {
    const entry = peer.consumers.get(producerId);
    if (!entry) return;

    entry.paused = paused;
    // Before the client confirms, the consumer stays paused whatever is wanted.
    if (!entry.ready) return;
    if (paused === entry.consumer.paused) return;

    if (paused) await entry.consumer.pause();
    else await entry.consumer.resume();
};

export const setConsumerLayer = async (
    peer: Peer,
    producerId: string,
    layer: SimulcastLayer
): Promise<void> => {
    const entry = peer.consumers.get(producerId);
    if (!entry) return;

    entry.layer = layer;
    await entry.consumer.setPreferredLayers({
        spatialLayer: SPATIAL_LAYER[layer],
    });
};

type NewConsumer = {
    producerId: string;
    kind: ProducerKind;
    layer: SimulcastLayer | null;
    paused: boolean;
};

// Builds the consumer paused on the receive transport of the peer. Returns
// null when it cannot be built, the receiver cannot decode the stream or the
// producer is gone.
export const buildConsumer = async (
    router: types.Router,
    peer: Peer,
    want: NewConsumer,
    ownerId: string
): Promise<ConsumerEntry | null> => {
    const { recvTransport, rtpCapabilities } = peer;
    if (!recvTransport || !rtpCapabilities) return null;

    const canConsume = router.canConsume({
        producerId: want.producerId,
        rtpCapabilities,
    });
    if (!canConsume) return null;

    const consumer = await recvTransport.consume({
        producerId: want.producerId,
        rtpCapabilities,
        paused: true,
        preferredLayers: want.layer
            ? { spatialLayer: SPATIAL_LAYER[want.layer] }
            : undefined,
    });

    return {
        consumer,
        ownerId,
        producerId: want.producerId,
        kind: want.kind,
        layer: want.layer,
        paused: want.paused,
        ready: false,
    };
};
