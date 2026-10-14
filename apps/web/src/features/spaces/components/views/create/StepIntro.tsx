import type { CreateStep } from "../../../consts/createSteps";
import { getCreateStepCopy } from "../../../utils/getCreateStepCopy";

export const StepIntro = ({ step }: { step: CreateStep }) => {
    const { title, description } = getCreateStepCopy(step);

    return (
        <div className="flex flex-col gap-2">
            <h1 className="text-xl font-medium">{title}</h1>
            <p className="text-sm text-muted-foreground">{description}</p>
        </div>
    );
};
