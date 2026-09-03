import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";
import { Tabs as TabsPrimitive } from "@base-ui/react/tabs";
import { Button } from "@/components/ui/button";
import type { SpaceSidebarTab } from "@/features/spaces/consts/sidebar";

type TriggerProps = {
    tab: SpaceSidebarTab;
    icon: LucideIcon;
    label: string;
    onSelect: (tab: SpaceSidebarTab) => void;
};

// Rendered from the unstyled Base UI primitive instead of the styled
// TabsTrigger: the tab keeps its semantics while the element that actually
// renders is a plain Button, identical to the other control bar buttons.
export const Trigger = ({ tab, icon: Icon, label, onSelect }: TriggerProps) => {
    return (
        <TabsPrimitive.Tab
            value={tab}
            aria-label={label}
            onClick={() => onSelect(tab)}
            render={<Button variant="outline" size="icon-lg" />}
        >
            <Icon />
        </TabsPrimitive.Tab>
    );
};

export const TriggerGroup = ({ children }: { children: ReactNode }) => {
    return (
        <TabsPrimitive.List className="flex items-center gap-2">
            {children}
        </TabsPrimitive.List>
    );
};
