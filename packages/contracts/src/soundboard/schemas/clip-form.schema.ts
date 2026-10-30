import { z } from "zod/v4";
import {
    SoundboardClipIconSchema,
    SoundboardClipNameSchema,
    SoundboardClipVolumeSchema,
} from "./clip.schema";

// The fields of the upload and the edit form. An empty icon means none, since
// a text field cannot hold null. The trimmed range and the file are not form
// fields: the editor keeps them and the form only sends their result.
export const SoundboardClipFormSchema = z.object({
    name: SoundboardClipNameSchema,
    icon: z.union([z.literal(""), SoundboardClipIconSchema]),
    volume: SoundboardClipVolumeSchema,
});

export type SoundboardClipFormValues = z.infer<typeof SoundboardClipFormSchema>;
