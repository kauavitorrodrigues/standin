import type { ComponentType } from "react";
import type { SettingsSectionId } from "../../../consts/sections";
import { AudioSection } from "./AudioSection";
import { GeneralSection } from "./GeneralSection";
import { GuestsSection } from "./GuestsSection";
import { MembersSection } from "./MembersSection";
import { StreamingSection } from "./StreamingSection";
import { PerformanceSection } from "./PerformanceSection";
import { NotificationsSection } from "./NotificationsSection";
import { VideoSection } from "./VideoSection";

export const SETTINGS_SECTION_VIEWS: Record<SettingsSectionId, ComponentType> =
    {
        general: GeneralSection,
        audio: AudioSection,
        video: VideoSection,
        streaming: StreamingSection,
        notifications: NotificationsSection,
        performance: PerformanceSection,
        members: MembersSection,
        guests: GuestsSection,
    };
