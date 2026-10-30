import { ControlsRow } from "@/features/spaces/components/pages/space-page/controls/ControlsRow";
import { useLazyMount } from "../../hooks/useLazyMount";
import type { SpaceSoundboard } from "../../types/space";
import { LazyContent } from "../views/LazyContent";
import { SoundboardPanel } from "./SoundboardPanel";

type Props = { isOpen: boolean; soundboard: SpaceSoundboard | null };

// The soundboard as a row of the control card, like the status card. The
// clips are fetched when it is first opened, not with the page.
export const SoundboardRow = ({ isOpen, soundboard }: Props) => {
    const mounted = useLazyMount(isOpen);
    if (soundboard === null) return null;

    return (
        <ControlsRow isOpen={isOpen}>
            <LazyContent mounted={mounted}>
                <SoundboardPanel soundboard={soundboard} />
            </LazyContent>
        </ControlsRow>
    );
};
