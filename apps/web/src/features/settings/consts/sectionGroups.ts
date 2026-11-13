import {
    BellIcon,
    BoltIcon,
    EarIcon,
    BlocksIcon,
    LockIcon,
    MessagesSquareIcon,
    MonitorUpIcon,
    PlugIcon,
    MicIcon,
    SettingsIcon,
    UserRoundIcon,
    UsersRoundIcon,
    VideoIcon,
    type LucideIcon,
} from "lucide-react";
import type { SettingsSectionId } from "./sections";

export type SettingsSectionGroup = {
    title: string;
    // True for the group of the space: only shown inside one.
    isSpace?: boolean;
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
            { id: "ambient", icon: EarIcon },
            { id: "integrations", icon: PlugIcon },
            { id: "performance", icon: BoltIcon },
        ],
    },
    {
        title: "Espaço",
        isSpace: true,
        sections: [
            { id: "guests", icon: UserRoundIcon },
            { id: "conversations", icon: MessagesSquareIcon },
            { id: "security", icon: LockIcon },
        ],
    },
    {
        title: "Organização",
        isSpace: true,
        sections: [
            { id: "members", icon: UsersRoundIcon },
            { id: "apps", icon: BlocksIcon },
        ],
    },
];
