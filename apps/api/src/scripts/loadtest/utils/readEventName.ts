// The name of the event inside a socket.io text packet, which looks like
// `2["space:positions",{...}]`. The type digit is 2 for an event (5 when it has
// binary attachments, then `<count>-`), and a namespace and an ack id may come
// before the array. Anything that is not an event has no name.
const EVENT_PACKET = /^[25](?:\d+-)?(?:\/[^,]*,)?\d*\["([^"]+)"/;

export const UNNAMED_EVENT = "other";

export const readEventName = (data: unknown): string => {
    if (typeof data !== "string") return UNNAMED_EVENT;

    return EVENT_PACKET.exec(data)?.[1] ?? UNNAMED_EVENT;
};
