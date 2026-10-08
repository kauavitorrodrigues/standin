// Shape of one entry in the list the API hands to RTCPeerConnection. Kept
// structurally identical to the DOM's RTCIceServer so the client can pass it
// straight through.
export type IceServer = {
    urls: string | string[];
    username?: string;
    credential?: string;
};

export type IceServersResponse = {
    iceServers: IceServer[];
};
