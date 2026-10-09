import { Building2Icon, MapIcon } from "lucide-react";
import { useLocation, useNavigate } from "@tanstack/react-router";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
    HEADER_TABS,
    HEADER_TAB_VALUES,
    type HeaderTab,
} from "@/consts/headerTabs";
import { resolveHeaderTab } from "@/utils/resolveHeaderTab";

// The tab lives in the URL: each one is a page, so a reload or a shared link
// lands on the same tab.
export const HeaderTabs = () => {
    const pathname = useLocation({ select: (location) => location.pathname });
    const navigate = useNavigate();

    return (
        <Tabs
            value={resolveHeaderTab(pathname)}
            onValueChange={(value: HeaderTab) => {
                const tab = HEADER_TABS.find((item) => item.value === value);
                if (tab) navigate({ to: tab.to });
            }}
        >
            <TabsList>
                <TabsTrigger value={HEADER_TAB_VALUES.SPACES} icon={Building2Icon}>
                    Espaços
                </TabsTrigger>
                <TabsTrigger value={HEADER_TAB_VALUES.MAPS} icon={MapIcon}>
                    Mapas
                </TabsTrigger>
            </TabsList>
        </Tabs>
    );
};
