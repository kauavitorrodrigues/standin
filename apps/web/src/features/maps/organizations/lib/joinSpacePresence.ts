import type { PresenceSocket } from "../types/presenceSocket";

type JoinSpacePresenceInput = {
    socket: PresenceSocket;
    spaceId: string;
};

// Joins the space room and nothing else: no peer connections, no media and no
// position are sent, so the user stays online for the others while the
// avatar does not move. Joining on "connect" also rejoins after a drop.
// Returns the teardown, which removes the listener and ends the connection
// the same way the space page does when it unmounts.
export const joinSpacePresence = ({
    socket,
    spaceId,
}: JoinSpacePresenceInput): (() => void) => {
    // Only the space goes: the server knows who is joining from the token and
    // which organization the space belongs to from the space itself.
    const onConnect = () => socket.emit("space:join", { spaceId });

    socket.on("connect", onConnect);

    if (socket.connected) onConnect();
    else socket.connect();

    return () => {
        socket.off("connect", onConnect);
        socket.disconnect();
    };
};
