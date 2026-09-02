// Public STUN/TURN fallback (Open Relay Project - free, no signup required),
// used alongside simple-peer's built-in Google STUN default. Host candidates
// alone aren't always reachable between two different browser processes even
// on the same machine (e.g. a sandboxed browser blocking local UDP/mDNS), and
// a restrictive NAT has the same symptom on a real network - TURN relays
// through a reachable server in both cases. See "Fase 7" in
// .claude/multiplayer.md.
export const ICE_SERVERS: RTCIceServer[] = [
    { urls: "stun:openrelay.metered.ca:80" },
    {
        urls: "turn:openrelay.metered.ca:80",
        username: "openrelayproject",
        credential: "openrelayproject",
    },
    {
        urls: "turn:openrelay.metered.ca:443",
        username: "openrelayproject",
        credential: "openrelayproject",
    },
    {
        urls: "turn:openrelay.metered.ca:443?transport=tcp",
        username: "openrelayproject",
        credential: "openrelayproject",
    },
];
