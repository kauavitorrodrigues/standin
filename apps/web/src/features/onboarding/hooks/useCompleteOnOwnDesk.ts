import { useEffect } from "react";
import { ONBOARDING_TASKS } from "@standin/contracts";
import type { Desk } from "@/features/desks/types/desk";
import { useCompleteTask } from "./useCompleteTask";

// Having a desk completes its task, however the desk came: claimed here, given
// by the owner of the organization, or already there when the person arrived.
export function useCompleteOnOwnDesk(desks: readonly Desk[], userId: string) {
    const complete = useCompleteTask();
    const hasOwnDesk = desks.some((desk) => desk.userId === userId);

    useEffect(() => {
        if (!hasOwnDesk) return;
        complete(ONBOARDING_TASKS.CLAIM_DESK);
    }, [hasOwnDesk, complete]);
}
