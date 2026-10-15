import type { ReactNode } from "react";
import { PanelToggleButton } from "@/components/editor/PanelToggleButton";
import { SidePanel } from "@/components/editor/SidePanel";
import { SidePanelHeader } from "@/components/editor/SidePanelHeader";
import { TILE_EDITOR_KEYS } from "../../../consts/editorKeys";
import { TILE_PANEL_LABEL } from "../../../consts/editorPanel";
import { useTileEditorContext } from "../../../hooks/editor/useEditorContext";

type Props = {
    title: string;
    onExit: () => void;
    // The menu of the tileset, beside the title.
    actions?: ReactNode;
    // What goes in the body: the fields of the page that holds the editor.
    children?: ReactNode;
};

// The side panel of the editor: the title bar, and under it the fields of the
// page, which scroll by themselves. It floats over the sheet.
export const TileEditorProperties = ({
    title,
    onExit,
    actions,
    children,
}: Props) => {
    const { propertiesOpen, toggleProperties } = useTileEditorContext();

    return (
        <SidePanel open={propertiesOpen}>
            <SidePanelHeader title={title} actions={actions} onExit={onExit}>
                <PanelToggleButton
                    label={TILE_PANEL_LABEL}
                    shortcut={TILE_EDITOR_KEYS.TOGGLE_PROPERTIES[0].toUpperCase()}
                    open={propertiesOpen}
                    onToggle={toggleProperties}
                />
            </SidePanelHeader>
            <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto p-4 pt-2">
                {children}
            </div>
        </SidePanel>
    );
};
