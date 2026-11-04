import type { SpaceAnnouncersPayload } from "@standin/contracts";

// Writes the list of announcers to one socket.
export type AnnouncersSender = (
    socketId: string,
    payload: SpaceAnnouncersPayload
) => void;
