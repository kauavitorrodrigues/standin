import { MediaEvents } from "@standin/contracts";
import type { MediaNotifier } from "@standin/media";
import { SocketManager } from "@/lib/socket/socketManager";

/**
 * Hands what the media server decided to the socket of the person it concerns.
 * It is the only place where the media module meets Socket.IO.
 */
export const mediaNotifier: MediaNotifier = {
    consumerNew: (peerId, payload) =>
        SocketManager.emitToSocket(peerId, MediaEvents.CONSUMER_NEW, payload),
    consumerClosed: (peerId, payload) =>
        SocketManager.emitToSocket(
            peerId,
            MediaEvents.CONSUMER_CLOSED,
            payload
        ),
    producerDemand: (peerId, payload) =>
        SocketManager.emitToSocket(
            peerId,
            MediaEvents.PRODUCER_DEMAND,
            payload
        ),
};
