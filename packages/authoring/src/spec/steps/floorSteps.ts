import { paintFloor } from "../../builders/paintFloor";
import type { Spec, SpecStep } from "../../types";
import { libraryRef } from "../compile/libraryRef";

export const floorSteps = ({ floors = [] }: Spec): SpecStep[] =>
    floors.map(({ tileset, tileIndex, from, to, layer }, index) => {
        const path = `floors[${index}]`;
        return {
            path,
            refs: [libraryRef("tileset", tileset, `${path}.tileset`)],
            build: (model) =>
                paintFloor(model, {
                    from: [from.x, from.y],
                    to: [to.x, to.y],
                    tileset,
                    tileIndex,
                    ...(layer === undefined ? {} : { layer }),
                }),
        };
    });
