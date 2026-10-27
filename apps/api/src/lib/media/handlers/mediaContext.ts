import type { Socket } from "socket.io";
import { MediaNotJoinedError, MediaUnavailableError } from "@standin/contracts";
import { MediaRuntime } from "../MediaRuntime";
import type { MediaContext } from "../types";

const spaceIdOf = (socket: Socket): string => {
    const spaceId = socket.data.spaceId as string | null;
    if (!spaceId) throw new MediaNotJoinedError();
    return spaceId;
};

/**
 * The media of the space the socket joined, with the person added to it. The
 * space always comes from the socket and never from the client, and a person
 * is never left behind when the socket drops while the router is being made.
 *
 * @throws MediaNotJoinedError when the socket is in no space.
 */
export const requireMediaContext = async (
    socket: Socket
): Promise<MediaContext> => {
    const spaceId = spaceIdOf(socket);
    const room = await MediaRuntime.acquireRoom(spaceId);

    // The socket may have left or dropped while the router was being made, and
    // nothing would clean a person added now.
    if (!socket.connected || socket.data.spaceId !== spaceId) {
        MediaRuntime.leave(spaceId, socket.id);
        throw new MediaNotJoinedError();
    }

    room.addPeer(socket.id, socket.data.userId as string);
    return { spaceId, room };
};

/**
 * A person that is already part of the router, for requests that only make
 * sense after the first one built it.
 *
 * @throws MediaUnavailableError when the person has no media session.
 */
export const requireExistingMediaContext = (socket: Socket): MediaContext => {
    const spaceId = spaceIdOf(socket);
    const room = MediaRuntime.getRoom(spaceId);
    if (!room?.hasPeer(socket.id)) throw new MediaUnavailableError();
    return { spaceId, room };
};
