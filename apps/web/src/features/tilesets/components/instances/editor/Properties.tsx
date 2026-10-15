import type { ReactNode } from "react";
import { ResizableHandle, ResizablePanel } from "@/components/ui/resizable";
import {
    PROPERTIES_PANEL_DEFAULT_SIZE,
    PROPERTIES_PANEL_ID,
    PROPERTIES_PANEL_MAX_SIZE,
    PROPERTIES_PANEL_MIN_SIZE,
} from "../../../consts/propertiesPanel";
import { cn } from "@/lib/utils";
import { useTileEditorContext } from "../../../hooks/editor/useEditorContext";
import { usePanelHandleClick } from "../../../hooks/editor/usePanelHandleClick";

type Props = {
    // What goes on top: the fields of the page that holds the editor.
    children?: ReactNode;
};

// The panel of properties beside the editor: the fields of the page. It scrolls
// by itself, its divider pulls it wider or narrower, and a click on the divider
// folds it away to give the editor all the width, or opens it again. Folded, the
// divider draws no line, since the sidebar of the app already has its border.
export const TileEditorProperties = ({ children }: Props) => {
    const {
        propertiesPanelRef,
        onPropertiesResize,
        propertiesOpen,
        propertiesPanelElementRef,
        toggleProperties,
        setDividerHeld,
    } = useTileEditorContext();
    const handleRef = usePanelHandleClick(toggleProperties, setDividerHeld);

    return (
        <>
            <ResizablePanel
                id={PROPERTIES_PANEL_ID}
                panelRef={propertiesPanelRef}
                defaultSize={PROPERTIES_PANEL_DEFAULT_SIZE}
                minSize={PROPERTIES_PANEL_MIN_SIZE}
                maxSize={PROPERTIES_PANEL_MAX_SIZE}
                collapsible
                elementRef={propertiesPanelElementRef}
                style={{ overflow: "hidden" }}
                collapsedSize={0}
                onResize={onPropertiesResize}
            >
                <div className="flex h-full min-w-96 flex-col gap-4 overflow-y-auto p-6">
                    {children}
                </div>
            </ResizablePanel>
            <ResizableHandle
                elementRef={handleRef}
                disableDoubleClick
                className={cn(
                    "cursor-pointer",
                    !propertiesOpen && "bg-transparent after:w-3"
                )}
            />
        </>
    );
};
