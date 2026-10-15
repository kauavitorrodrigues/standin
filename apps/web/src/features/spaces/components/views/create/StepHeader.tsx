import { Link } from "@tanstack/react-router";
import { LogoFull } from "@/components/logos";
import { CREATE_STEPS, type CreateStep } from "../../../consts/createSteps";
import { BackButton } from "./BackButton";

type Props = { step: CreateStep; onBack: () => void };

const StepBack = ({ step, onBack }: Props) => {
    switch (step) {
        case CREATE_STEPS.SIZE:
            return <BackButton render={<Link to="/home" />} />;
        case CREATE_STEPS.MAP:
            return <BackButton type="button" onClick={onBack} />;
    }
};

// Back leaves the page on the first step and goes one step back on the next.
export const StepHeader = ({ step, onBack }: Props) => (
    <div className="relative flex items-center justify-center">
        <StepBack step={step} onBack={onBack} />
        <LogoFull />
    </div>
);
