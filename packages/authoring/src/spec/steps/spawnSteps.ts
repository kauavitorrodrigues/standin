import { setSpawn } from "../../builders/setSpawn";
import type { Spec, SpecStep } from "../../types";

// Only a map or a template has spawn points.
export const spawnSteps = (spec: Spec): SpecStep[] => {
    if (spec.kind === "area") return [];

    return (spec.spawns ?? []).map(({ x, y, label }, index) => ({
        path: `spawns[${index}]`,
        refs: [],
        build: (model) =>
            setSpawn(model, {
                tileX: x,
                tileY: y,
                ...(label === undefined ? {} : { label }),
            }),
    }));
};
