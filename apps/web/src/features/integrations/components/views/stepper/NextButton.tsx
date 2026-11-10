import { Button } from "@/components/ui/button";

type Props = {
    canGoNext: boolean;
    onNext: () => void;
    // A step with a form: the button submits it (to save) instead of just
    // moving on.
    formId?: string;
};

// The button that goes to the next step, or saves the form of this one first.
// The two have their own keys: if React reused one element and turned it into
// a submit button while the click on "next" is still being handled, that same
// click would submit the form of the new step and show its errors untouched.
export const StepNextButton = ({ canGoNext, onNext, formId }: Props) => {
    if (formId) {
        return (
            <Button
                key="submit"
                type="submit"
                form={formId}
                disabled={!canGoNext}
            >
                Avançar
            </Button>
        );
    }

    return (
        <Button key="next" type="button" disabled={!canGoNext} onClick={onNext}>
            Avançar
        </Button>
    );
};
