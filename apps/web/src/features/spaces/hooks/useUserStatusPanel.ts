import { CONTROLS_VIEWS } from "@/features/spaces/consts/controls-view";
import type { ControlsViewState } from "@/features/spaces/hooks/useControlsView";

type Options = {
    // The view open over the bar, shared with the reactions and the nearby
    // panel so only one is open at a time.
    controls: Pick<ControlsViewState, "view" | "toggle">;
};

/** The state of the status card that opens over the control bar. */
export const useUserStatusPanel = ({ controls }: Options) => ({
    isOpen: controls.view === CONTROLS_VIEWS.STATUS,
    onToggle: () => controls.toggle(CONTROLS_VIEWS.STATUS),
});

export type UserStatusPanelState = ReturnType<typeof useUserStatusPanel>;
