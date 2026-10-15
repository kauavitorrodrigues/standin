import { useCallback, useState } from "react";
import { NO_DECORATOR_FOCUS } from "@/features/decorator/consts/no-focus";
import type { DecoratorFocus } from "@/features/decorator/types/decorator-focus";

type Session = {
    isOpen: boolean;
    focus: DecoratorFocus;
};

const CLOSED: Session = { isOpen: false, focus: NO_DECORATOR_FOCUS };

// Whether the decorator is open over the game, and where it opened (a desk,
// an object, or nowhere). The page that holds the game owns it, and whatever
// opens the decorator (the profile card, the space menu) calls `open`.
export const useDecoratorSession = () => {
    const [session, setSession] = useState<Session>(CLOSED);

    const open = useCallback(
        (focus: DecoratorFocus = NO_DECORATOR_FOCUS) =>
            setSession({ isOpen: true, focus }),
        []
    );
    const close = useCallback(() => setSession(CLOSED), []);

    return { ...session, open, close };
};
