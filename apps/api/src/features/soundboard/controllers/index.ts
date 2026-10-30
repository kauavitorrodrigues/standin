import { createSoundboardClip } from "./create";
import { listSoundboardClips } from "./list";
import { removeSoundboardClip } from "./remove";
import { updateSoundboardClip } from "./update";

export const SoundboardController = {
    list: listSoundboardClips,
    create: createSoundboardClip,
    update: updateSoundboardClip,
    remove: removeSoundboardClip,
};
