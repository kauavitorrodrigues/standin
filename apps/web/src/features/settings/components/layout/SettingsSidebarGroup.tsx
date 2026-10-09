import { TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { SettingsSectionGroup } from "../../consts/sectionGroups";
import { getSettingsSectionTitle } from "../../utils/getSettingsSectionTitle";

export const SettingsSidebarGroup = ({
    group,
}: {
    group: SettingsSectionGroup;
}) => (
    <div className="flex flex-col gap-1">
        <span className="pl-1 pb-1 text-[13px] font-medium text-muted-foreground">
            {group.title}
        </span>
        <TabsList className="h-auto w-full flex-col items-stretch gap-0.5 bg-transparent p-0">
            {group.sections.map(({ id, icon }) => (
                <TabsTrigger
                    key={id}
                    value={id}
                    icon={icon}
                    className="h-8 w-full flex-none justify-start gap-2 rounded-lg border-none px-2 text-[13px] font-semibold text-foreground/80 hover:bg-foreground/5 data-active:bg-primary data-active:text-primary-foreground dark:data-active:bg-primary dark:data-active:text-primary-foreground"
                >
                    {getSettingsSectionTitle(id)}
                </TabsTrigger>
            ))}
        </TabsList>
    </div>
);
