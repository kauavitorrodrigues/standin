import type {
    CommandContext,
    CommandOutput,
    MapValidateArgs,
    MapValidateResult,
    PreparedMap,
} from "../../../types";
import { prepareMapPlan } from "../shared/prepareMapPlan";
import { MAP_VALIDATE_MESSAGES } from "./consts";

export const runMapValidate = async ({
    args,
    env,
    files,
    config,
    http,
}: CommandContext<MapValidateArgs>): Promise<CommandOutput> => {
    const { plan }: PreparedMap = await prepareMapPlan(args, env, {
        files,
        config,
        http,
    });

    const result: MapValidateResult = {
        valid: true,
        mapId: plan.mapId,
        kind: plan.kind,
        layoutVersion: plan.layoutVersion,
        opCount: plan.ops.length,
    };
    const line: string = MAP_VALIDATE_MESSAGES.valid(
        result.opCount,
        result.mapId,
        result.layoutVersion
    );
    return { result, lines: [line] };
};
