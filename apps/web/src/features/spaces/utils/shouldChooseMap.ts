import { CREATE_STEPS, type CreateStep } from "../consts/createSteps";

// Choosing the size only leads to the map step when there is a map to choose.
// Otherwise the blank map is the only one and the space can be created.
export const shouldChooseMap = (
    step: CreateStep,
    hasTemplates: boolean
): boolean => {
    switch (step) {
        case CREATE_STEPS.SIZE:
            return hasTemplates;
        case CREATE_STEPS.MAP:
            return false;
    }
};
