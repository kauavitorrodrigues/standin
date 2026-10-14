import { LayoutTemplateIcon } from "lucide-react";
import { TabsTrigger } from "@/components/ui/tabs";
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import { PANEL_TABS } from "@/features/editor/consts/panelTabs";

type AreasTabTriggerProps = { show: boolean };

// The switch of the areas list. An editor that cannot place areas hides it.
export const AreasTabTrigger = ({ show }: AreasTabTriggerProps) => {
    if (!show) return null;

    return (
        <Tooltip>
            <TooltipTrigger
                render={
                    <TabsTrigger
                        value={PANEL_TABS.AREAS}
                        aria-label="Áreas"
                        className="flex-none px-2"
                    />
                }
            >
                <LayoutTemplateIcon />
            </TooltipTrigger>
            <TooltipContent side="bottom">Áreas</TooltipContent>
        </Tooltip>
    );
};
