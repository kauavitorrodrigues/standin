import { cn } from "@/lib/utils";
import type { AppStep } from "../../../types/step";

type Props = {
    steps: AppStep[];
    currentIndex: number;
};

// One small dot per step, filled up to the current one.
export const StepDots = ({ steps, currentIndex }: Props) => (
    <div
        role="img"
        aria-label={`Passo ${currentIndex + 1} de ${steps.length}`}
        className="flex items-center gap-1.5"
    >
        {steps.map((step, index) => (
            <span
                key={step.value}
                className={cn(
                    "size-1.5 rounded-full bg-foreground/20 transition-colors",
                    index <= currentIndex && "bg-primary"
                )}
            />
        ))}
    </div>
);
