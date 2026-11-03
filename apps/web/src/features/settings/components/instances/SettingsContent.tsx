import { useState } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import {
    DEFAULT_SETTINGS_SECTION,
    FILL_SETTINGS_SECTIONS,
    SETTINGS_SECTION_IDS,
    type SettingsSectionId,
} from "../../consts/sections";
import { SettingsSpaceContext } from "../../contexts/SettingsSpaceContext";
import type { SettingsSpace } from "../../types";
import { getSettingsSectionTitle } from "../../utils/getSettingsSectionTitle";
import { getVisibleSettingsGroups } from "../../utils/getVisibleSettingsGroups";
import { isSectionOffered } from "../../utils/isSectionOffered";
import { SettingsHeader } from "../layout/SettingsHeader";
import { SettingsSidebar } from "../layout/SettingsSidebar";
import { SETTINGS_SECTION_VIEWS } from "../views/sections";

type Props = {
    space: SettingsSpace | undefined;
    initialSection: SettingsSectionId | undefined;
};

const resolveFirstSection = (
    initialSection: SettingsSectionId | undefined,
    space: SettingsSpace | undefined
): SettingsSectionId => {
    const target = initialSection ?? DEFAULT_SETTINGS_SECTION;
    if (!isSectionOffered(target, space)) return DEFAULT_SETTINGS_SECTION;
    return target;
};

const renderSection = (id: SettingsSectionId) => {
    const View = SETTINGS_SECTION_VIEWS[id];
    return <View />;
};

// The sidebar and the selected section. The dialog mounts it each time it
// opens, so it starts on the section it was asked to land on.
export const SettingsContent = ({ space, initialSection }: Props) => {
    const [section, setSection] = useState<SettingsSectionId>(() =>
        resolveFirstSection(initialSection, space)
    );

    const isFill = FILL_SETTINGS_SECTIONS.includes(section);
    const offered = SETTINGS_SECTION_IDS.filter(
        (id) =>
            isSectionOffered(id, space) && !FILL_SETTINGS_SECTIONS.includes(id)
    );

    return (
        <SettingsSpaceContext.Provider value={space ?? null}>
            <Tabs
                orientation="vertical"
                value={section}
                onValueChange={(value) =>
                    setSection(value as SettingsSectionId)
                }
                className="min-h-0 flex-1 flex-row gap-0"
            >
                <SettingsSidebar groups={getVisibleSettingsGroups(space)} />
                <div className="flex min-h-0 min-w-0 flex-1 flex-col">
                    <SettingsHeader title={getSettingsSectionTitle(section)} />
                    {isFill ? (
                        <TabsContent
                            value={section}
                            className="flex min-h-0 flex-1 flex-col"
                        >
                            {renderSection(section)}
                        </TabsContent>
                    ) : (
                        <ScrollArea className="min-h-0 flex-1">
                            {offered.map((id) => (
                                <TabsContent key={id} value={id}>
                                    {renderSection(id)}
                                </TabsContent>
                            ))}
                        </ScrollArea>
                    )}
                </div>
            </Tabs>
        </SettingsSpaceContext.Provider>
    );
};
