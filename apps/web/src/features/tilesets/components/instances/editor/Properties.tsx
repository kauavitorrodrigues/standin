import type { ReactNode } from "react";
import { PanelToggleButton } from "@/features/editor/components/views/PanelToggleButton";
import { PanelTitle } from "@/features/editor/components/views/PanelTitle";
import { SidePanel } from "@/features/editor/components/layout/SidePanel";
import { SidePanelHeader } from "@/features/editor/components/layout/SidePanelHeader";
import { TILE_EDITOR_KEYS } from "../../../consts/editorKeys";
import { useTileEditorContext } from "../../../hooks/editor/useEditorContext";

type Props = {
    title: string;
    onExit: () => void;
    // The name as the button that opens the menu of the tileset.
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
            <SidePanelHeader
                title={<PanelTitle name={title} menu={actions} />}
                onExit={onExit}
            >
                <PanelToggleButton
                    label="Painel do tileset"
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
