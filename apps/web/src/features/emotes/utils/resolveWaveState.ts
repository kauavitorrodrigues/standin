import { WAVE } from "@/features/emotes/consts/wave";
import type { WaveRecord, WaveState } from "@/features/emotes/types/wave";

export const resolveWaveState = (
    record: WaveRecord,
    now: number
): WaveState => {
    if (record.sentAt === null) {
        return { isCoolingDown: false, nextChangeMs: null };
    }

    const left = WAVE.SEND_COOLDOWN_MS - (now - record.sentAt);
    if (left <= 0) return { isCoolingDown: false, nextChangeMs: null };

    return { isCoolingDown: true, nextChangeMs: left };
};
