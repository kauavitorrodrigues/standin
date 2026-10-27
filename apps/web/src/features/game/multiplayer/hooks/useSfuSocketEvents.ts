import type { UseSfuSocketEventsOptions } from "../types/sfuHooks";
import { useSocketEvent } from "./useSocketEvent";

/**
 * Listens to what the server says about media: a stream appeared or went
 * away, who is speaking, who muted the microphone, who put the headphones on, and that the media server
 * restarted and the session has to be built again.
 */
export function useSfuSocketEvents({
    supervisorRef,
    applySpeakers,
    setRemoteMicMuted,
    setRemotePrivacy,
}: UseSfuSocketEventsOptions) {
    useSocketEvent("media:consumer-new", (payload) =>
        supervisorRef.current?.handleConsumerNew(payload)
    );
    useSocketEvent("media:consumer-closed", ({ consumerId }) =>
        supervisorRef.current?.handleConsumerClosed(consumerId)
    );
    useSocketEvent("media:producer-demand", ({ source, wanted }) =>
        supervisorRef.current?.setDemand(source, wanted)
    );
    useSocketEvent("media:speakers", ({ userIds }) => applySpeakers(userIds));
    useSocketEvent("media:state-changed", ({ userId, muted }) =>
        setRemoteMicMuted(userId, muted)
    );
    useSocketEvent("media:privacy-changed", ({ userId, headphones, focus }) =>
        setRemotePrivacy(userId, { headphones, focus })
    );
    useSocketEvent("media:reset", () => supervisorRef.current?.reset());
}
