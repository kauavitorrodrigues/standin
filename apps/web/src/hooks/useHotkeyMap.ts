import { useEffect } from "react";
import { useAsRef } from "@/hooks/useAsRef";
import { isTypingTarget } from "@/hooks/useHotkey";

type Options = { enabled?: boolean };

type Handlers = Readonly<Record<string, (event: KeyboardEvent) => void>>;

// The name a key press goes by in the map. It is the physical key
// (`event.code`, lower case, like "digit1" or "numpad1"), which is what tells
// the number row from the numpad. With ctrl or meta it gets the "mod+" prefix,
// and "shift+" after it when shift is also down ("mod+shift+keyz"). Shift
// alone does not change the name, so a handler reads it from the event.
const getHotkeyName = (event: KeyboardEvent): string | null => {
    const code = event.code.toLowerCase();
    if (event.altKey) return null;
    if (!event.ctrlKey && !event.metaKey) return code;
    return `mod+${event.shiftKey ? "shift+" : ""}${code}`;
};

// Like `useHotkey`, for many keys at once, matched by `getHotkeyName`.
export const useHotkeyMap = (
    handlers: Handlers,
    { enabled = true }: Options = {}
) => {
    const handlersRef = useAsRef(handlers);

    useEffect(() => {
        if (!enabled) return;

        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.defaultPrevented || event.repeat) return;
            if (isTypingTarget(event.target)) return;
            const name = getHotkeyName(event);
            const handler = name ? handlersRef.current[name] : undefined;
            if (!handler) return;

            event.preventDefault();
            handler(event);
        };

        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [enabled, handlersRef]);
};
