import { callApi } from "../../../api/callApi";
import type {
    ApplyAnswer,
    ApplyBody,
    HttpTransport,
    MapPlan,
    RemoteTarget,
} from "../../../types";
import { WRITE_TIMEOUT_MS } from "../../../consts/api";
import { MAP_PATHS } from "../consts";
import { buildApplyBody } from "./buildApplyBody";

// Sends the ops of a plan to the map. With `validateOnly` the server replays
// them and writes nothing.
export const sendMapApply = (
    http: HttpTransport,
    target: RemoteTarget,
    plan: MapPlan,
    baseVersion: number,
    validateOnly: boolean
): Promise<ApplyAnswer> => {
    const body: ApplyBody = buildApplyBody(plan, baseVersion, validateOnly);
    return callApi<ApplyAnswer>(http, target, {
        method: "POST",
        path: MAP_PATHS.apply(plan.mapId),
        body,
        timeoutMs: WRITE_TIMEOUT_MS,
    });
};
