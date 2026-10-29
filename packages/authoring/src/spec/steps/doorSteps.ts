import { placeDoor } from "../../builders/placeDoor";
import type { Spec, SpecStep } from "../../types";
import { libraryRef } from "../compile/libraryRef";

// After every room, so a door never depends on the order of the rooms.
export const doorSteps = ({ rooms = [] }: Spec): SpecStep[] =>
    rooms.flatMap((room, roomIndex) =>
        (room.doors ?? []).map(({ side, door, offset }, index) => {
            const path = `rooms[${roomIndex}].doors[${index}]`;
            return {
                path,
                refs: [libraryRef("asset", door, `${path}.door`)],
                build: (model) =>
                    placeDoor(model, {
                        room: room.key,
                        side,
                        door,
                        ...(offset === undefined ? {} : { offset }),
                    }),
            };
        })
    );
