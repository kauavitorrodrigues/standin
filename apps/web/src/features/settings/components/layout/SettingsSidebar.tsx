import { ScrollArea } from "@/components/ui/scroll-area";
import { SETTINGS_SECTION_GROUPS } from "../../consts/sectionGroups";
import { SettingsSidebarGroup } from "./SettingsSidebarGroup";

export const SettingsSidebar = () => (
    <ScrollArea className="w-60 shrink-0 bg-muted">
        <nav className="flex flex-col gap-6 p-3">
            {SETTINGS_SECTION_GROUPS.map((group) => (
                <SettingsSidebarGroup key={group.title} group={group} />
            ))}
        </nav>
    </ScrollArea>
);
