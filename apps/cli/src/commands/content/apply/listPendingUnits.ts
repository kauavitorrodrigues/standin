import { LIBRARY_REF, STEP_TARGETS } from "../../../consts/steps";
import type { ContentPlan, StepRef } from "../../../types";

// What a run has to do: the library, then each template.
export const listPendingUnits = (plan: ContentPlan): StepRef[] => {
    const units: StepRef[] = [];
    if (plan.library) units.push(LIBRARY_REF);
    units.push(
        ...plan.templates.map(({ name }) => ({
            target: STEP_TARGETS.TEMPLATE,
            name,
        }))
    );
    return units;
};
