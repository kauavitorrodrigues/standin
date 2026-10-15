import type { ReactNode } from "react";

type PanelProps = {
    children: ReactNode;
};

// The panel of the decorator: fixed on the right of the space, over the game
// and under the shell of the app (sidebar, minimap and media controls stay
// visible around it). It takes the height it needs up to a limit, and leaves
// the room of the zoom buttons and of the media bar below it.
export const Panel = ({ children }: PanelProps) => (
    <aside
        aria-label="Decorador"
        className="pointer-events-auto absolute top-2.5 right-2.5 z-40 flex h-[min(37.75rem,calc(100%-9rem))] w-80 flex-col overflow-hidden rounded-xl border bg-background text-foreground shadow-2xl"
    >
        {children}
    </aside>
);
