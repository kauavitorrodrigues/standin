import type { ReactNode } from "react";
import { moveCategoryFocus } from "../../utils/moveCategoryFocus";

type SlotProps = { children: ReactNode };

// The three columns of the "Editar avatar" dialog: the categories on the left,
// the parts and their colors in the middle, the preview on the right.
const Body = ({ children }: SlotProps) => (
    <div className="grid h-[34rem] grid-cols-[11rem_minmax(0,1fr)_minmax(0,18rem)] gap-4">
        {children}
    </div>
);

const Slots = ({ children }: SlotProps) => (
    <nav
        aria-label="Partes do avatar"
        onKeyDown={(event) => {
            if (moveCategoryFocus(event.currentTarget, event.key)) {
                event.preventDefault();
            }
        }}
        className="flex min-h-0 flex-col gap-1 overflow-y-auto rounded-xl bg-muted p-2"
    >
        {children}
    </nav>
);

const Center = ({ children }: SlotProps) => (
    <div className="flex min-h-0 flex-col gap-3">{children}</div>
);

const Preview = ({ children }: SlotProps) => (
    <div className="flex min-h-0 flex-col gap-2">{children}</div>
);

export const AvatarEditorLayout = { Body, Slots, Center, Preview };
