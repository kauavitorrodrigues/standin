import { composeOps } from "../../compose/composeOps";
import type { CompileSpecOptions, CompileSpecResult, Spec } from "../../types";
import { deskSteps } from "../steps/deskSteps";
import { doorSteps } from "../steps/doorSteps";
import { floorSteps } from "../steps/floorSteps";
import { objectSteps } from "../steps/objectSteps";
import { roomSteps } from "../steps/roomSteps";
import { spawnSteps } from "../steps/spawnSteps";
import { zoneSteps } from "../steps/zoneSteps";
import { locateIssue } from "./locateIssue";
import { resolveBase } from "./resolveBase";

/**
 * Compiles a checked spec to editor ops with the builders. The order is fixed:
 * floors, rooms, doors, zones, desks, objects, spawns, so the same spec on the
 * same base gives the same ops. Issues point into the spec. A spawn point is
 * asked for on a map unless `requireSpawn` says otherwise.
 */
export const compileSpec = (
    spec: Spec,
    options: CompileSpecOptions = {}
): CompileSpecResult => {
    const base = resolveBase(spec, options);
    if (!base.ok) return { ok: false, issues: [base.issue] };

    const steps = [
        ...floorSteps(spec),
        ...roomSteps(spec),
        ...doorSteps(spec),
        ...zoneSteps(spec),
        ...deskSteps(spec),
        ...objectSteps(spec),
        ...spawnSteps(spec),
    ];
    const composed = composeOps(
        base.value,
        steps.map(({ build }) => build),
        { requireSpawn: options.requireSpawn ?? spec.kind === "map" }
    );
    if (composed.ok) return composed;

    const step = steps[composed.stepIndex];
    return {
        ok: false,
        issues: composed.issues.map((issue) => locateIssue(issue, step)),
    };
};
