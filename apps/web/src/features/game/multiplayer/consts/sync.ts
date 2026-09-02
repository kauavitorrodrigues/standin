export const SEND_INTERVAL_MS = 80;

// A peer connection that never fires "connect" within this window (bad ICE
// candidates, a peer that closed its tab mid-negotiation before space:peer-left
// arrives, a network that blocks UDP entirely) is torn down instead of left
// hanging forever with a frozen, unresponsive avatar.
export const PEER_CONNECT_TIMEOUT_MS = 15000;
