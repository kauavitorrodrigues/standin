import { DoorOpenIcon, LibraryIcon } from "lucide-react";
import { useLocation, useNavigate } from "@tanstack/react-router";
import { ROLES } from "@standin/auth";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useRoles } from "@/features/auth/hooks/useRoles";
import { AREA_ROUTES, AREA_VALUES, type Area } from "../../consts/areas";
import { resolveArea } from "../../utils/resolveArea";

// Only the owner of the organization has a second area, the library of the
// organization. Everyone else keeps just the spaces, with no tabs.
export const AreaTabs = () => {
    const roles = useRoles();
    const navigate = useNavigate();
    const pathname = useLocation({ select: (location) => location.pathname });

    if (!roles.includes(ROLES.OWNER)) return null;

    return (
        <Tabs
            value={resolveArea(pathname)}
            onValueChange={(area: Area) => navigate({ to: AREA_ROUTES[area] })}
        >
            <TabsList>
                <TabsTrigger value={AREA_VALUES.SPACES} icon={DoorOpenIcon}>
                    Espaços
                </TabsTrigger>
                <TabsTrigger value={AREA_VALUES.LIBRARY} icon={LibraryIcon}>
                    Biblioteca
                </TabsTrigger>
            </TabsList>
        </Tabs>
    );
};
