import type { ReactNode } from "react";

type Props = {
    setElement: (element: HTMLDivElement | null) => void;
    totalSize: number;
    children: ReactNode;
};

// The scrolling area of the list. It grows with its content up to a share of
// the screen, and the rows are laid out inside it by their offset. It always
// keeps the room of its scrollbar, so what sits above it, such as the header
// of a table, lines up with the rows whether the scrollbar shows or not.
export const ScrollFrame = ({ setElement, totalSize, children }: Props) => (
    <div
        ref={setElement}
        className="max-h-[60vh] min-h-32 min-w-0 overflow-x-hidden overflow-y-auto [scrollbar-gutter:stable]"
    >
        <div
            className="relative w-full transition-[height] duration-200 ease-out motion-reduce:transition-none"
            style={{ height: totalSize }}
        >
            {children}
        </div>
    </div>
);
