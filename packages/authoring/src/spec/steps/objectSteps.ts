import { placeObject } from "../../builders/placeObject";
import type { Spec, SpecStep } from "../../types";
import { libraryRef } from "../compile/libraryRef";
import { toSpot } from "../compile/toSpot";

export const objectSteps = ({ objects = [] }: Spec): SpecStep[] =>
    objects.map((object, index) => {
        const path = `objects[${index}]`;
        return {
            path,
            refs: [libraryRef("asset", object.asset, `${path}.asset`)],
            build: (model) => placeObject(model, toSpot(object)),
        };
    });
