// Perfect negotiation needs exactly one side of a pair to be "polite" (it
// rolls back its own pending offer when an incoming one collides) and the
// other "impolite" (it ignores the colliding offer). Comparing the two
// socket ids gives both sides the same answer with no extra signaling: the
// side with the greater id is polite.
export const isPolitePeer = (
    localSocketId: string,
    remoteSocketId: string
): boolean => localSocketId > remoteSocketId;
