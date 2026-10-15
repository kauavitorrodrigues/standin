import type { UseFormReturn } from "react-hook-form";
import type { MapTemplate } from "@standin/contracts";
import { CREATE_STEPS, type CreateStep } from "../../../consts/createSteps";
import { useSpaceSourceSelection } from "../../../hooks/useSpaceSourceSelection";
import type { CreateSpaceFormValues } from "../../../schemas/createSpaceForm";
import { MapStep } from "./MapStep";
import { SizeStep } from "./SizeStep";

type Props = {
    form: UseFormReturn<CreateSpaceFormValues>;
    templates: MapTemplate[];
    step: CreateStep;
    isLoading: boolean;
    disabled: boolean;
};

// What the left side holds on each step.
export const StepFields = ({
    form,
    templates,
    step,
    isLoading,
    disabled,
}: Props) => {
    const selection = useSpaceSourceSelection(form, templates);

    switch (step) {
        case CREATE_STEPS.SIZE:
            return (
                <SizeStep
                    form={form}
                    tier={selection.tier}
                    isLoading={isLoading}
                    disabled={disabled}
                    onSelectTier={selection.selectTier}
                />
            );
        case CREATE_STEPS.MAP:
            return (
                <MapStep
                    templates={selection.tierTemplates}
                    templateId={selection.templateId}
                    isBlank={selection.isBlank}
                    disabled={disabled}
                    onSelectTemplate={selection.selectTemplate}
                    onSelectBlank={selection.selectBlank}
                />
            );
    }
};
