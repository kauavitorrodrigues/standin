import type { SoundboardClipFormValues } from "@standin/contracts";
import type { ClipDraft } from "../types/clip";
import { clampVolume } from "./clampVolume";

/** The form holds no icon as an empty string, the rest of the code as null. */
export const formValuesToDraft = ({
    name,
    icon,
    volume,
}: SoundboardClipFormValues): ClipDraft => ({
    name: name.trim(),
    icon: icon === "" ? null : icon,
    volume: clampVolume(volume),
});
