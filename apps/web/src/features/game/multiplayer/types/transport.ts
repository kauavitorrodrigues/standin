// The three independent outgoing media channels of a peer link. Each one
// owns its own transceiver and its own MediaStream id, so the receiving
// side can tell a camera track from a screen track (both are plain video).
export const MEDIA_SLOTS = {
    AUDIO: "audio",
    CAMERA: "camera",
    SCREEN: "screen",
} as const;

export type MediaSlot = (typeof MEDIA_SLOTS)[keyof typeof MEDIA_SLOTS];

// Wire format relayed opaquely by the server over webrtc:signal.
export type PeerSignal = {
    description?: RTCSessionDescriptionInit;
    candidate?: RTCIceCandidateInit;
};

export type RemoteTrack = {
    track: MediaStreamTrack;
    // Id of the MediaStream the sender attached the track to, or null when
    // the sender did not associate one.
    streamId: string | null;
};

export type PeerLinkEvents = {
    onSignal: (signal: PeerSignal) => void;
    onOpen: () => void;
    onData: (data: string) => void;
    onTrack: (remote: RemoteTrack) => void;
    onClose: () => void;
};

export type SlotEncoding = {
    maxBitrate?: number;
    maxFramerate?: number;
    scaleResolutionDownBy?: number;
};
