import {
    BellIcon,
    BoltIcon,
    MonitorUpIcon,
    MicIcon,
    SettingsIcon,
    VideoIcon,
    type LucideIcon,
} from "lucide-react";
import type { SettingsSectionId } from "./sections";

export type SettingsSectionGroup = {
    title: string;
    sections: { id: SettingsSectionId; icon: LucideIcon }[];
};

export const SETTINGS_SECTION_GROUPS: SettingsSectionGroup[] = [
    {
        title: "Preferências",
        sections: [
            { id: "general", icon: SettingsIcon },
            { id: "audio", icon: MicIcon },
            { id: "video", icon: VideoIcon },
            { id: "streaming", icon: MonitorUpIcon },
            { id: "notifications", icon: BellIcon },
            { id: "performance", icon: BoltIcon },
        ],
    },
];
