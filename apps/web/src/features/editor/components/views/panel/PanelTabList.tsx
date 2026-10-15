import { BoxIcon, ImageIcon } from "lucide-react";
import { TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PANEL_TABS } from "@/features/editor/consts/panelTabs";
import { AreasTabTrigger } from "./AreasTabTrigger";

type PanelTabListProps = { withAreas: boolean };

// The switch between the lists of the panel, a row under the title bar with an
// icon and the name of each list, sharing the width of the panel.
export const PanelTabList = ({ withAreas }: PanelTabListProps) => (
    <div className="shrink-0 px-3 pb-0">
        <TabsList className="w-full">
            <TabsTrigger value={PANEL_TABS.OBJECTS} aria-label="Objetos">
                <BoxIcon />
                Objetos
            </TabsTrigger>
            <TabsTrigger value={PANEL_TABS.TILES} aria-label="Tiles">
                <ImageIcon />
                Tiles
            </TabsTrigger>
            <AreasTabTrigger show={withAreas} />
        </TabsList>
    </div>
);
