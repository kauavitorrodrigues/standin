export type PresenceSocket = {
    connected: boolean;
    connect: () => void;
    disconnect: () => void;
    emit: (
        event: "space:join",
        payload: { organizationId: string; spaceId: string; userId: string }
    ) => void;
    on: (event: "connect", listener: () => void) => void;
    off: (event: "connect", listener: () => void) => void;
};
