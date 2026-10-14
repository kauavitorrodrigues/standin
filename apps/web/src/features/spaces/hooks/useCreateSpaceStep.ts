import { useState } from "react";
import { CREATE_STEPS, type CreateStep } from "../consts/createSteps";

export const useCreateSpaceStep = () => {
    const [step, setStep] = useState<CreateStep>(CREATE_STEPS.SIZE);

    return {
        step,
        goToSize: () => setStep(CREATE_STEPS.SIZE),
        goToMap: () => setStep(CREATE_STEPS.MAP),
    };
};
