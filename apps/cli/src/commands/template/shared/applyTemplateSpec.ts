import type { TemplateSpec } from "@standin/authoring";
import type {
    MapContext,
    MapPlan,
    StepRef,
    TemplateFlow,
} from "../../../types";
import { trackWrite } from "../../shared/trackWrite";
import { compileMapPlan } from "../../map/shared/compileMapPlan";
import { fetchMapContext } from "../../map/shared/fetchMapContext";
import { sendMapApply } from "../../map/shared/sendMapApply";

// Builds the spec on the map of the template, the way `map apply` does, and
// applies it. The map is blank, so the version just read is the base. It
// gives back how many ops were applied.
export const applyTemplateSpec = async (
    { http, target, progress }: TemplateFlow,
    step: StepRef,
    spec: TemplateSpec,
    mapId: string
): Promise<number> => {
    const context: MapContext = await fetchMapContext(http, target, mapId);
    const plan: MapPlan = compileMapPlan(spec, context, mapId);
    await trackWrite(progress, step, () =>
        sendMapApply(http, target, plan, plan.layoutVersion, false)
    );
    return plan.ops.length;
};
