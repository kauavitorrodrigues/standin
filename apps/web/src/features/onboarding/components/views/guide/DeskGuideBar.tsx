import { Button } from "@/components/ui/button";
import { DESK_GUIDE_STEPS } from "../../../consts/deskGuide";
import { ONBOARDING_MESSAGES } from "../../../consts/messages";
import type { DeskGuideStep } from "../../../types/deskGuide";

type Props = {
    step: DeskGuideStep;
    onWalk: () => void;
    onClose: () => void;
};

const BAR_CLASS =
    "pointer-events-auto flex animate-in items-center gap-2.5 rounded-xl bg-muted py-1 pr-1 pl-3 text-xs font-semibold text-foreground ring-1 ring-foreground/10 duration-300 ease-out fade-in-0 slide-in-from-bottom-4 motion-reduce:animate-none";

// The bar over the bottom of the map, at the spot of the walk chip, while the
// desk guide runs.
export const DeskGuideBar = ({ step, onWalk, onClose }: Props) => (
    <div
        role="status"
        className="pointer-events-none absolute right-0 bottom-20 left-(--rail-width) z-30 flex justify-center px-4"
    >
        <div className={BAR_CLASS}>
            <StepBody step={step} onWalk={onWalk} onClose={onClose} />
        </div>
    </div>
);

const StepBody = ({ step, onWalk, onClose }: Props) => {
    switch (step) {
        case DESK_GUIDE_STEPS.PICK:
            return (
                <>
                    {ONBOARDING_MESSAGES.DESK_GUIDE_PICK}
                    <Button type="button" onClick={onClose}>
                        {ONBOARDING_MESSAGES.DESK_GUIDE_CANCEL}
                    </Button>
                </>
            );
        case DESK_GUIDE_STEPS.NONE_FREE:
            return (
                <>
                    {ONBOARDING_MESSAGES.DESK_GUIDE_NONE_FREE}
                    <Button type="button" onClick={onClose}>
                        {ONBOARDING_MESSAGES.DESK_GUIDE_CLOSE}
                    </Button>
                </>
            );
        case DESK_GUIDE_STEPS.WALK:
            return (
                <>
                    {ONBOARDING_MESSAGES.DESK_GUIDE_DONE}
                    <Button type="button" onClick={onWalk}>
                        {ONBOARDING_MESSAGES.DESK_GUIDE_WALK}
                    </Button>
                    <Button type="button" variant="ghost" onClick={onClose}>
                        {ONBOARDING_MESSAGES.DESK_GUIDE_DISMISS}
                    </Button>
                </>
            );
    }
};
