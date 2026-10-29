import type { types } from "mediasoup-client";

/**
 * Whether a transport is worth an ICE restart: it is still open and its
 * connection is lost or broken. A closed one belongs to a session that is
 * already over, and one that is connecting or connected needs nothing.
 */
export const isIceRestartNeeded = (
    transport: Pick<types.Transport, "closed" | "connectionState">
): boolean =>
    !transport.closed &&
    (transport.connectionState === "disconnected" ||
        transport.connectionState === "failed");
