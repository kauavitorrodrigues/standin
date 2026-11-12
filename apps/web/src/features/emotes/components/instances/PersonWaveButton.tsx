import { WaveButton } from "@/features/emotes/components/views/WaveButton";
import { WaveHint } from "@/features/emotes/components/views/WaveHint";
import { WAVE_BUTTON } from "@/features/emotes/consts/waveButton";
import { useIsPersonNear } from "@/features/emotes/hooks/useIsPersonNear";
import { useWaveState } from "@/features/emotes/hooks/useWaveState";
import type { PersonWave } from "@/features/emotes/types/wave";

type PersonWaveButtonProps = PersonWave & { userId: string };

// The wave button of the card of a person. It is off while they are out of
// reach, with the reason under it, and during the cooldown that follows a
// wave, so a click is never swallowed without a word.
export const PersonWaveButton = ({
    userId,
    isPersonNear,
    onWave,
    activity,
}: PersonWaveButtonProps) => {
    const isNear = useIsPersonNear(isPersonNear, userId);
    const state = useWaveState(activity, userId);

    return (
        <div className="mt-3 flex flex-col gap-1.5">
            <WaveButton
                label={
                    state.isCoolingDown
                        ? WAVE_BUTTON.LABEL_SENT
                        : WAVE_BUTTON.LABEL
                }
                isDisabled={!isNear || state.isCoolingDown}
                onWave={() => onWave(userId)}
            />
            <WaveHint text={isNear ? null : WAVE_BUTTON.TOO_FAR} />
        </div>
    );
};
