import { z } from "zod/v4";
import { SoundboardErrorMessages as Messages } from "./error-messages";

const clipId = z
    .string({ error: Messages.clipId.invalid })
    .min(1, { error: Messages.clipId.invalid })
    .max(64, { error: Messages.clipId.invalid });

export const SoundboardPlaySchema = z.object({ clipId });

// The stop names the play it means, so it only ends that one.
export const SoundboardStopSchema = z.object({ playId: clipId });
