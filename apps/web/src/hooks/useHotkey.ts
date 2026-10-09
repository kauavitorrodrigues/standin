import { useEffect } from "react";
import { useAsRef } from "@/hooks/useAsRef";

type Options = { enabled?: boolean };

const isTypingTarget = (target: EventTarget | null): boolean => {
    if (!(target instanceof HTMLElement)) return false;
    return (
        target.isContentEditable ||
        ["INPUT", "TEXTAREA", "SELECT"].includes(target.tagName)
    );
};

// Fires `onPress` when one of `keys` is pressed on its own (no ctrl, meta or
// alt) while the user is not typing somewhere. Keys are matched against
// `event.key`, case-insensitive.
export const useHotkey = (
    keys: readonly string[],
    onPress: () => void,
    { enabled = true }: Options = {}
) => {
    const onPressRef = useAsRef(onPress);
    const keysKey = keys.join("|");

    useEffect(() => {
        if (!enabled) return;
        const accepted = keysKey.split("|");

        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.defaultPrevented || event.repeat) return;
            if (event.ctrlKey || event.metaKey || event.altKey) return;
            if (isTypingTarget(event.target)) return;
            if (!accepted.includes(event.key.toLowerCase())) return;

            event.preventDefault();
            onPressRef.current();
        };

        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [keysKey, enabled, onPressRef]);
};
