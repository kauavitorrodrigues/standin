import { createRoom } from "../../builders/createRoom";
import type { Spec, SpecRef, SpecStep } from "../../types";
import { libraryRef } from "../compile/libraryRef";
import { toRoomWalls } from "../compile/toRoomWalls";

// A room without its own style takes the one of the spec.
export const roomSteps = ({ rooms = [], style }: Spec): SpecStep[] =>
    rooms.map((room, index) => {
        const path = `rooms[${index}]`;
        const walls = room.walls ?? style?.walls;
        const floor = room.floor ?? style?.floor;
        const wallsPath = room.walls ? `${path}.walls` : "style.walls";
        const floorPath = room.floor ? `${path}.floor` : "style.floor";
        const refs: SpecRef[] = [
            ...(walls
                ? [libraryRef("tileset", walls.tileset, `${wallsPath}.tileset`)]
                : []),
            ...(floor
                ? [libraryRef("tileset", floor.tileset, `${floorPath}.tileset`)]
                : []),
        ];

        return {
            path,
            refs,
            build: (model) =>
                createRoom(model, {
                    key: room.key,
                    label: room.label,
                    x: room.x,
                    y: room.y,
                    width: room.width,
                    height: room.height,
                    ...(walls ? { walls: toRoomWalls(walls) } : {}),
                    ...(floor ? { floor } : {}),
                }),
        };
    });
