import { WAVE_TOAST_TEXTS } from "@/features/emotes/consts/waveToast";
import type { WavePerson } from "@/features/emotes/types/wave";

// The toast for a wave that arrived: who waved, with their avatar, and what
// they did. Someone whose name is not known still gets a toast.
export const describeWaveToast = (
    userId: string,
    person: WavePerson | undefined
) => ({
    title: person?.name ?? WAVE_TOAST_TEXTS.unknownName,
    description: WAVE_TOAST_TEXTS.suffix,
    type: "info" as const,
    data: {
        avatar: {
            id: userId,
            name: person?.name ?? WAVE_TOAST_TEXTS.unknownName,
            src: person?.profilePictureUrl ?? null,
        },
    },
});
