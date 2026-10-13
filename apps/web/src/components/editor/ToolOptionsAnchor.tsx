import type { ReactNode } from "react";
import { TOOL_OPTIONS_INSET_PX } from "@/components/editor/consts/toolbar";
import { useAnchorTop } from "@/hooks/useAnchorTop";

type Props = {
    // The `anchorId` of the toolbar button in use.
    anchorId: string;
    // The `ToolOptionsPanel`s, one over the other.
    children: ReactNode;
};

// The column of the options of the tool in use, on the left of the toolbar. It
// sits at the height of the button of the tool, with its first button right
// beside it, so the pointer does not have to travel.
export const ToolOptionsAnchor = ({ anchorId, children }: Props) => {
    const { ref, top } = useAnchorTop(anchorId);

    return (
        <div
            ref={ref}
            data-ready={top !== null}
            style={{ top: (top ?? 0) - TOOL_OPTIONS_INSET_PX }}
            className="pointer-events-none absolute right-16 z-10 flex flex-col items-end gap-2 transition-[top] duration-150 ease-out data-[ready=false]:opacity-0"
        >
            {children}
        </div>
    );
};
