import type { Namespace, Server } from "socket.io";
import { SpaceEvents } from "@standin/contracts";
import type { RaisedHandsSender } from "../realtime/types";

// Sends the list to one socket by its id, from the server or the namespace.
export const buildRaisedHandsSender =
    (target: Pick<Server, "to"> | Pick<Namespace, "to">): RaisedHandsSender =>
    (socketId, payload) => {
        target.to(socketId).emit(SpaceEvents.SPACE_RAISED_HANDS, payload);
    };
