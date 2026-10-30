import { CONTROLS_VIEWS } from "@/features/spaces/consts/controls-view";
import type { SoundboardPanelOptions } from "../types/panel";

/** The state of the soundboard section that opens inside the control card. */
export const useSoundboardPanel = ({
    controls,
    enabled,
}: SoundboardPanelOptions) => ({
    isOpen: enabled && controls.view === CONTROLS_VIEWS.SOUNDBOARD,
    onToggle: () => controls.toggle(CONTROLS_VIEWS.SOUNDBOARD),
});

export type SoundboardPanelState = ReturnType<typeof useSoundboardPanel>;
