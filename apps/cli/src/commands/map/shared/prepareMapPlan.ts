import type { Spec } from "@standin/authoring";
import { resolveRemoteTarget } from "../../../config/resolveRemoteTarget";
import type {
    CliEnv,
    MapContext,
    MapPlan,
    MapSeams,
    MapValidateArgs,
    PreparedMap,
    RemoteTarget,
} from "../../../types";
import { compileMapPlan } from "./compileMapPlan";
import { fetchMapContext } from "./fetchMapContext";
import { loadSpec } from "./loadSpec";

// The steps both commands share: the spec is read and checked first, since
// that needs no network, then the map is read and the spec is compiled on it.
export const prepareMapPlan = async (
    args: MapValidateArgs,
    env: CliEnv,
    { files, config, http }: MapSeams
): Promise<PreparedMap> => {
    const spec: Spec = await loadSpec(files, env, args.spec);
    const target: RemoteTarget = await resolveRemoteTarget(args, env, config);
    const context: MapContext = await fetchMapContext(http, target, args.map);
    const plan: MapPlan = compileMapPlan(spec, context, args.map);
    return { target, plan };
};
