import { createZone } from "../../builders/createZone";
import type { Spec, SpecStep } from "../../types";

export const zoneSteps = ({ zones = [] }: Spec): SpecStep[] =>
    zones.map((zone, index) => ({
        path: `zones[${index}]`,
        refs: [],
        build: (model) => createZone(model, zone),
    }));
