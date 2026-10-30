import { SOUNDBOARD_VOLUME_DEFAULT } from "@standin/contracts";
import type { SoundboardClipFormValues } from "@standin/contracts";

export const SOUNDBOARD_CLIP_FORM_DEFAULTS: SoundboardClipFormValues = {
    name: "",
    icon: "",
    volume: SOUNDBOARD_VOLUME_DEFAULT,
};
