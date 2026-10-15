import type { Ref } from "react";

type HintLineProps = {
    ref: Ref<HTMLDivElement>;
};

// One line above the media bar with what the tool in use says: why a spot is
// refused, or how to drop the object. The scene writes it straight into the
// element, and it hides itself while it is empty.
export const HintLine = ({ ref }: HintLineProps) => (
    <div className="pointer-events-none absolute inset-x-0 bottom-24 z-30 flex justify-center">
        <div
            ref={ref}
            role="status"
            className="rounded-full border bg-background/90 px-3 py-1 text-xs shadow-sm backdrop-blur empty:hidden"
        />
    </div>
);
