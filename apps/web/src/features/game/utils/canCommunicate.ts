// Two avatars communicate only from inside the same private room, or when
// neither is inside one. A null key means "outside every private room".
export const canCommunicate = (
    localRoomKey: string | null,
    remoteRoomKey: string | null
): boolean => localRoomKey === remoteRoomKey;

// The distance the media rules see for a remote avatar. An avatar that cannot
// communicate is unreachable, and Infinity exceeds every radius.
export const getCommunicationDistance = (
    distance: number,
    localRoomKey: string | null,
    remoteRoomKey: string | null
): number =>
    canCommunicate(localRoomKey, remoteRoomKey)
        ? distance
        : Number.POSITIVE_INFINITY;
