import type { UploadPhase } from "../types/upload";

type Input = { isSubmitting: boolean; progress: number | null };

/** Encoding until the bytes start to go, then sending. */
export const resolveUploadPhase = ({
    isSubmitting,
    progress,
}: Input): UploadPhase => {
    if (!isSubmitting) return "idle";
    if (progress === null) return "encoding";
    return "sending";
};
