export type NearbyMessage = {
    id: string;
    // The user id, not the socket, so the color survives a reconnection.
    senderId: string;
    text: string;
    // The local clock when it arrived, never a time the peer claims.
    at: number;
};

export type NearbyBubbleLine = {
    message: NearbyMessage;
    opacity: number;
};

// What the views read from the store. A new object for every change.
export type NearbySnapshot = {
    history: readonly NearbyMessage[];
    strip: readonly NearbyMessage[];
    typingUserIds: ReadonlySet<string>;
};
