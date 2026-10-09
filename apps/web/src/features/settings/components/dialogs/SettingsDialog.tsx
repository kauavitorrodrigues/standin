import { useState } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import {
    DEFAULT_SETTINGS_SECTION,
    SETTINGS_SECTION_IDS,
    type SettingsSectionId,
} from "../../consts/sections";
import { getSettingsSectionTitle } from "../../utils/getSettingsSectionTitle";
import { SettingsHeader } from "../layout/SettingsHeader";
import { SettingsSidebar } from "../layout/SettingsSidebar";
import { SETTINGS_SECTION_VIEWS } from "../views/sections";

type Props = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
};

// Preferences on the left, the selected section on the right.
export const SettingsDialog = ({ open, onOpenChange }: Props) => {
    const [section, setSection] = useState<SettingsSectionId>(
        DEFAULT_SETTINGS_SECTION
    );

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent
                showCloseButton={false}
                className="flex h-150 max-h-[calc(100%-2rem)] gap-0 overflow-hidden p-0 sm:max-w-225"
            >
                <Tabs
                    orientation="vertical"
                    value={section}
                    onValueChange={(value) =>
                        setSection(value as SettingsSectionId)
                    }
                    className="min-h-0 flex-1 flex-row gap-0"
                >
                    <SettingsSidebar />
                    <div className="flex min-h-0 min-w-0 flex-1 flex-col">
                        <SettingsHeader
                            title={getSettingsSectionTitle(section)}
                        />
                        <ScrollArea className="min-h-0 flex-1">
                            {SETTINGS_SECTION_IDS.map((id) => {
                                const View = SETTINGS_SECTION_VIEWS[id];
                                return (
                                    <TabsContent key={id} value={id}>
                                        <View />
                                    </TabsContent>
                                );
                            })}
                        </ScrollArea>
                    </div>
                </Tabs>
            </DialogContent>
        </Dialog>
    );
};
