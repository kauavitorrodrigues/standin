import { useEffect } from "react";
import { useAsRef } from "@/hooks/useAsRef";

// Ctrl+F (Cmd+F on Apple platforms) runs `onPress` and cancels the browser's
// own find bar, which is what the key means everywhere else. Unlike
// useHotkey it also works while typing in a field.
export const useSearchHotkey = (onPress: () => void) => {
    const onPressRef = useAsRef(onPress);

    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.defaultPrevented || event.repeat) return;
            if (!(event.ctrlKey || event.metaKey) || event.altKey) return;
            if (event.key.toLowerCase() !== "f") return;

            event.preventDefault();
            onPressRef.current();
        };

        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [onPressRef]);
};
