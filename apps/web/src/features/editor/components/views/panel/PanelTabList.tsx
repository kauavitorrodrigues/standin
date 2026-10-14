import { BoxIcon, ImageIcon } from "lucide-react";
import { TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import { PANEL_TABS } from "@/features/editor/consts/panelTabs";
import { AreasTabTrigger } from "./AreasTabTrigger";

type PanelTabListProps = { withAreas: boolean };

// The switch between the lists of the panel, with only an icon each. The
// name is in the tooltip. It sits in the title bar, beside the button that
// closes the panel.
export const PanelTabList = ({ withAreas }: PanelTabListProps) => (
    <TabsList>
        <Tooltip>
            <TooltipTrigger
                render={
                    <TabsTrigger
                        value={PANEL_TABS.OBJECTS}
                        aria-label="Objetos"
                        className="flex-none px-2"
                    />
                }
            >
                <BoxIcon />
            </TooltipTrigger>
            <TooltipContent side="bottom">Objetos</TooltipContent>
        </Tooltip>
        <Tooltip>
            <TooltipTrigger
                render={
                    <TabsTrigger
                        value={PANEL_TABS.TILES}
                        aria-label="Tiles"
                        className="flex-none px-2"
                    />
                }
            >
                <ImageIcon />
            </TooltipTrigger>
            <TooltipContent side="bottom">Tiles</TooltipContent>
        </Tooltip>
        <AreasTabTrigger show={withAreas} />
    </TabsList>
);
