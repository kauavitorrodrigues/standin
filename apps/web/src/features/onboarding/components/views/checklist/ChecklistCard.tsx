import { XIcon } from "lucide-react";
import type { OnboardingTaskKey } from "@standin/contracts";
import { Button } from "@/components/ui/button";
import { CircleProgress } from "@/components/ui/circle-progress";
import { SpacePageLayout as LayoutPrimitive } from "@/features/spaces/components/pages/space-page/layout";
import { ONBOARDING_MESSAGES } from "../../../consts/messages";
import type { ChecklistItem } from "../../../types/checklist";
import { ChecklistRow } from "./ChecklistRow";

type Props = {
    isOpen: boolean;
    items: readonly ChecklistItem[];
    doneCount: number;
    onSelect: (taskKey: OnboardingTaskKey) => void;
    onClose: () => void;
};

// The list of first steps. It never blocks anything: it closes with the X, by
// opening a step or by picking the button again.
export const ChecklistCard = ({
    isOpen,
    items,
    doneCount,
    onSelect,
    onClose,
}: Props) => (
    <LayoutPrimitive.FloatingCard
        isOpen={isOpen}
        className="flex flex-col gap-3 p-3"
    >
        <div className="flex items-center justify-between gap-2">
            <span className="text-sm font-medium">
                {ONBOARDING_MESSAGES.CHECKLIST_TITLE}
            </span>
            <div className="flex items-center gap-1">
                <CircleProgress
                    value={(doneCount / items.length) * 100}
                    className="size-9"
                    aria-label={ONBOARDING_MESSAGES.CHECKLIST_PROGRESS_LABEL}
                >
                    {doneCount}/{items.length}
                </CircleProgress>
                <Button
                    type="button"
                    icon={XIcon}
                    size="icon"
                    variant="ghost"
                    aria-label={ONBOARDING_MESSAGES.CLOSE}
                    onClick={onClose}
                    className="text-muted-foreground"
                />
            </div>
        </div>
        <ul className="flex flex-col gap-1">
            {items.map((item) => (
                <ChecklistRow
                    key={item.taskKey}
                    item={item}
                    onSelect={() => onSelect(item.taskKey)}
                />
            ))}
        </ul>
    </LayoutPrimitive.FloatingCard>
);
