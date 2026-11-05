import type { DanceKeyInfo } from "@/features/emotes/types/dance";
import { DANCE_HOTKEY_CODE } from "@/features/emotes/consts/shortcuts";

// Whether a key press starts the dance: the dance key on its own, and not the
// repeat a held key keeps sending. Shift, ctrl, meta and alt belong to other
// shortcuts, so they never start it.
export const isDanceKeyDown = (event: DanceKeyInfo): boolean => {
    if (event.code.toLowerCase() !== DANCE_HOTKEY_CODE) return false;
    if (event.repeat) return false;

    return !(event.shiftKey || event.ctrlKey || event.metaKey || event.altKey);
};

// Whether a key release ends the dance. Any release of the key does, even with
// a modifier pressed meanwhile, so the dance never outlives the key.
export const isDanceKeyUp = (event: Pick<KeyboardEvent, "code">): boolean =>
    event.code.toLowerCase() === DANCE_HOTKEY_CODE;
