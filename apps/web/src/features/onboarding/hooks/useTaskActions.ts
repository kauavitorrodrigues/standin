import { useMemo } from "react";
import { DECORATE_AVAILABILITY } from "@/features/decorator/consts/decorate-availability";
import type { DecorateAvailability } from "@/features/decorator/types/decorate-availability";
import type { DecoratorFocus } from "@/features/decorator/types/decorator-focus";
import type { Desk } from "@/features/desks/types/desk";
import { ONBOARDING_FLOW_KINDS } from "../consts/flow";
import { useOnboardingFlow } from "./useOnboardingFlow";
import { buildTaskActions } from "../utils/buildTaskActions";

type Params = {
    userId: string;
    desks: readonly Desk[];
    decorateAvailability: DecorateAvailability;
    openDecorator: (focus: DecoratorFocus) => void;
    openAvatarEditor: () => void;
};

// The actions the tasks of the checklist take in the space.
export function useTaskActions({
    userId,
    desks,
    decorateAvailability,
    openDecorator,
    openAvatarEditor,
}: Params) {
    const ownDeskId = desks.find((desk) => desk.userId === userId)?.mapAssetId;
    const canDecorate =
        decorateAvailability.kind === DECORATE_AVAILABILITY.ENABLED;

    const flow = useOnboardingFlow();
    const { open } = flow;

    return useMemo(
        () =>
            buildTaskActions({
                canDecorate,
                ownDeskId,
                openDecorator,
                openAvatarEditor,
                startDeskGuide: () =>
                    open({ kind: ONBOARDING_FLOW_KINDS.DESK_GUIDE }),
            }),
        [canDecorate, ownDeskId, openDecorator, openAvatarEditor, open]
    );
}
