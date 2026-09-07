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
    badge?: ReactNode;
    // Rendered inline, next to the icon, instead of as a floating corner
    // badge. Use this for a count that's part of what the button means (how
    // many participants), not for a notification layered on top of it.
    count?: number;
};

// Rendered from the unstyled Base UI primitive instead of the styled
// TabsTrigger: the tab keeps its semantics while the element that actually
// renders is a plain Button, identical to the other control bar buttons.
export const Trigger = ({
    tab,
    icon: Icon,
    label,
    onSelect,
    badge,
    count,
}: TriggerProps) => {
    return (
        <span className="relative inline-flex">
            <TabsPrimitive.Tab
                value={tab}
                aria-label={label}
                onClick={() => onSelect(tab)}
                render={
                    <Button
                        variant="outline"
                        size={count === undefined ? "icon-lg" : "lg"}
                    />
                }
            >
                <Icon />
                {count !== undefined && (
                    <>
                        <span className="size-1.5 rounded-full bg-emerald-500" />
                        <span className="text-xs tabular-nums">{count}</span>
                    </>
                )}
            </TabsPrimitive.Tab>
            {badge && (
                <span className="pointer-events-none absolute -top-1 -right-1">
                    {badge}
                </span>
            )}
        </span>
    );
};

export const TriggerGroup = ({ children }: { children: ReactNode }) => {
    return (
        <TabsPrimitive.List className="flex items-center gap-2">
            {children}
        </TabsPrimitive.List>
    );
};
