import { TabsContent } from "@/components/ui/tabs";
import { AreasTab } from "@/features/editor/components/instances/AreasTab";
import { PANEL_TABS } from "@/features/editor/consts/panelTabs";
import type { EditorPalette } from "@/features/editor/types/editor-palette";

type AreasTabPanelProps = { show: boolean; palette: EditorPalette };

// The areas list. An editor that cannot place areas does not render it.
export const AreasTabPanel = ({ show, palette }: AreasTabPanelProps) => {
    if (!show) return null;

    return (
        <TabsContent value={PANEL_TABS.AREAS} className="flex min-h-0 flex-col">
            <AreasTab palette={palette} />
        </TabsContent>
    );
};
