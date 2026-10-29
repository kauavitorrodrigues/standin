import { ScrollArea } from "@/components/ui/scroll-area";
import { formatBuildInfo } from "@/lib/buildInfo";
import { SETTINGS_SECTION_GROUPS } from "../../consts/sectionGroups";
import { SettingsSidebarGroup } from "./SettingsSidebarGroup";

export const SettingsSidebar = () => (
    <div className="flex w-60 shrink-0 flex-col bg-muted">
        <ScrollArea className="min-h-0 flex-1">
            <nav className="flex flex-col gap-6 p-3">
                {SETTINGS_SECTION_GROUPS.map((group) => (
                    <SettingsSidebarGroup key={group.title} group={group} />
                ))}
            </nav>
        </ScrollArea>
        <p className="px-4 py-3 text-xs text-muted-foreground select-text">
            {formatBuildInfo()}
        </p>
    </div>
);
