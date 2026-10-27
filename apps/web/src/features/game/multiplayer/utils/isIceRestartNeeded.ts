// Only a live connection that is disconnected or failed is worth restarting.
export const isIceRestartNeeded = (
    pc: Pick<RTCPeerConnection, "connectionState">
): boolean => {
    switch (pc.connectionState) {
        case "disconnected":
        case "failed":
            return true;
        default:
            return false;
    }
};
