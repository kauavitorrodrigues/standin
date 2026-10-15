import type { PresenceSocket } from "../types/presenceSocket";

type JoinSpacePresenceInput = {
    socket: PresenceSocket;
    organizationId: string;
    spaceId: string;
    userId: string;
};

// Joins the space room and nothing else: no peer connections, no media and no
// position are sent, so the user stays online for the others while the
// avatar does not move. Joining on "connect" also rejoins after a drop.
// Returns the teardown, which removes the listener and ends the connection
// the same way the space page does when it unmounts.
export const joinSpacePresence = ({
    socket,
    organizationId,
    spaceId,
    userId,
}: JoinSpacePresenceInput): (() => void) => {
    const onConnect = () =>
        socket.emit("space:join", { organizationId, spaceId, userId });

    socket.on("connect", onConnect);

    if (socket.connected) onConnect();
    else socket.connect();

    return () => {
        socket.off("connect", onConnect);
        socket.disconnect();
    };
};
