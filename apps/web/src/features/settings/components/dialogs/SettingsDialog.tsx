import { Dialog, DialogContent } from "@/components/ui/dialog";
import type { SettingsSectionId } from "../../consts/sections";
import type { SettingsSpace } from "../../types";
import { SettingsContent } from "../instances/SettingsContent";

type Props = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    // The space the dialog was opened in. Without it only the preferences show.
    space?: SettingsSpace;
    // The section to land on each time the dialog opens.
    initialSection?: SettingsSectionId;
};

// Preferences and the space on the left, the selected section on the right.
export const SettingsDialog = ({
    open,
    onOpenChange,
    space,
    initialSection,
}: Props) => (
    <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent
            showCloseButton={false}
            className="flex h-150 max-h-[calc(100%-2rem)] gap-0 overflow-hidden p-0 sm:max-w-225"
        >
            <SettingsContent space={space} initialSection={initialSection} />
        </DialogContent>
    </Dialog>
);
