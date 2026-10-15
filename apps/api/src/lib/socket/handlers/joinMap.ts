import type { Socket } from "socket.io";
import { MapJoinSchema } from "@standin/contracts";
import { MapService, UserService } from "@standin/core";
import { buildMapRoom } from "../utils/buildMapRoom";

// The map of a space is covered by the space room. A template has no space,
// so the admin editing it joins the room of the map to receive its events.
export function registerJoinMap(socket: Socket) {
    socket.on("map:join", async (payload) => {
        try {
            const parsed = MapJoinSchema.safeParse(payload);
            if (!parsed.success) return;

            // The role is read from the database, never from the socket.
            const user = await UserService.findById(socket.data.userId);
            if (!user) return;

            const access = await MapService.getAccess(user, parsed.data.mapId);
            if (access.owner.kind !== "template" || !access.canRead) return;

            await socket.join(buildMapRoom(access.mapId));
        } catch (error) {
            console.error(error);
        }
    });
}
