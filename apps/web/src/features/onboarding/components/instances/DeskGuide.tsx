import { useEffect } from "react";
import type { Desk } from "@/features/desks/types/desk";
import type { GameEngineHandle } from "@/features/game/types/game";
import { ONBOARDING_FLOW_KINDS } from "../../consts/flow";
import { DESK_GUIDE_STEPS } from "../../consts/deskGuide";
import { useOnboardingFlow } from "../../hooks/useOnboardingFlow";
import { resolveDeskGuideStep } from "../../utils/resolveDeskGuideStep";
import { DeskGuideBar } from "../views/guide/DeskGuideBar";

type Props = {
    handle: GameEngineHandle | null;
    desks: readonly Desk[];
    userId: string;
};

// The guide of the desk task: it outlines the free desks until the person
// takes one, then offers to walk there. What it draws on the map is undone
// when it ends, whichever way that happens.
export const DeskGuide = ({ handle, desks, userId }: Props) => {
    const flow = useOnboardingFlow();
    const isActive = flow.isActive(ONBOARDING_FLOW_KINDS.DESK_GUIDE);
    const hasOwnDesk = desks.some((desk) => desk.userId === userId);
    // The claims are only the desks that are held.
    const freeDeskCount = (handle?.getDeskCount() ?? 0) - desks.length;
    const step = resolveDeskGuideStep({ hasOwnDesk, freeDeskCount });
    const isPicking = isActive && step === DESK_GUIDE_STEPS.PICK;

    useEffect(() => {
        if (!isPicking) return;

        handle?.setDeskGuide(true);
        return () => handle?.setDeskGuide(false);
    }, [handle, isPicking]);

    if (!isActive) return null;

    const walk = () => {
        flow.close();
        handle?.walkToOwnDesk();
    };

    return <DeskGuideBar step={step} onWalk={walk} onClose={flow.close} />;
};
