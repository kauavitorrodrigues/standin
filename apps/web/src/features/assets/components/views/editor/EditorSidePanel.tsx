import type { ReactNode } from "react";

type Props = {
    children: ReactNode;
};

// The column beside the image, with what explains or lists it: the hint, the
// legend, the seats. It takes the height of the image and never scrolls the
// page.
export const EditorSidePanel = ({ children }: Props) => (
    <aside className="flex min-h-0 w-64 shrink-0 flex-col gap-3">
        {children}
    </aside>
);
