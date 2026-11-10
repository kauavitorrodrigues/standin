import { Button } from "@/components/ui/button";
import type { AppStep } from "../../../types/step";
import { StepDots } from "./Dots";
import { StepNextButton } from "./NextButton";

type Props = {
    steps: AppStep[];
    currentIndex: number;
    canGoBack: boolean;
    canGoNext: boolean;
    // The last step has nothing after it, so it has no next button.
    isLastStep?: boolean;
    onBack: () => void;
    onNext: () => void;
    // The form of the current step, when going on also saves it.
    nextFormId?: string;
};

// Back and next between the steps, with the dots of where the person is.
export const StepNav = ({
    steps,
    currentIndex,
    canGoBack,
    canGoNext,
    isLastStep = false,
    onBack,
    onNext,
    nextFormId,
}: Props) => (
    <div className="flex items-center justify-between gap-2">
        <Button
            type="button"
            variant="outline"
            disabled={!canGoBack}
            onClick={onBack}
        >
            Voltar
        </Button>
        <StepDots steps={steps} currentIndex={currentIndex} />
        {isLastStep ? (
            <span aria-hidden className="w-[4.5rem]" />
        ) : (
            <StepNextButton
                canGoNext={canGoNext}
                onNext={onNext}
                formId={nextFormId}
            />
        )}
    </div>
);
