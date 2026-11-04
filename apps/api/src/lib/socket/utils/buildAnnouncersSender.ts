import type { Namespace, Server } from "socket.io";
import { SpaceEvents } from "@standin/contracts";
import type { AnnouncersSender } from "../realtime/types";

// Sends the list to one socket by its id, from the server or the namespace.
export const buildAnnouncersSender =
    (target: Pick<Server, "to"> | Pick<Namespace, "to">): AnnouncersSender =>
    (socketId, payload) => {
        target.to(socketId).emit(SpaceEvents.SPACE_ANNOUNCERS, payload);
    };
