import { useEffect, useRef } from "react";
import { toast } from "@/components/ui/toast";
import { WAVE } from "@/features/emotes/consts/wave";
import { WaveGate } from "@/features/emotes/lib/WaveGate";
import type { WaveActivity } from "@/features/emotes/lib/WaveActivity";
import type { WavePerson } from "@/features/emotes/types/wave";
import { describeWaveToast } from "@/features/emotes/utils/describeWaveToast";

type Options = {
    activity: WaveActivity;
    personOf: (userId: string) => WavePerson | undefined;
};

// Tells me who just waved at me, since the emoji over their avatar is easy to
// miss. A person who waves again soon raises one toast, not one per wave.
export const useWaveToasts = ({ activity, personOf }: Options) => {
    const gateRef = useRef(new WaveGate(WAVE.TOAST_WINDOW_MS));
    const personOfRef = useRef(personOf);

    useEffect(() => {
        personOfRef.current = personOf;
    });

    useEffect(
        () =>
            activity.onReceived((senderUserId) => {
                if (!gateRef.current.allow(senderUserId, performance.now()))
                    return;

                toast.add(
                    describeWaveToast(
                        senderUserId,
                        personOfRef.current(senderUserId)
                    )
                );
            }),
        [activity]
    );
};
