import { LayoutTemplateIcon } from "lucide-react";
import { TabsTrigger } from "@/components/ui/tabs";
import { PANEL_TABS } from "@/features/editor/consts/panelTabs";

type AreasTabTriggerProps = { show: boolean };

// The switch of the areas list. An editor that cannot place areas hides it.
export const AreasTabTrigger = ({ show }: AreasTabTriggerProps) => {
    if (!show) return null;

    return (
        <TabsTrigger value={PANEL_TABS.AREAS} aria-label="Áreas">
            <LayoutTemplateIcon />
            Áreas
        </TabsTrigger>
    );
};
