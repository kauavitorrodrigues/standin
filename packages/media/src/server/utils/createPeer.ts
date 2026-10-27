import type { Peer } from "../spaceTypes";

export const createPeer = (id: string, userId: string): Peer => ({
    id,
    userId,
    roomKey: null,
    lowQuality: false,
    muted: false,
    headphones: false,
    focusMode: false,
    focus: new Map(),
    pins: [],
    rtpCapabilities: null,
    sendTransport: null,
    recvTransport: null,
    producers: new Map(),
    consumers: new Map(),
    lastChangeAt: undefined,
    applying: false,
});
