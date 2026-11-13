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
import { ConversationsSection } from "./ConversationsSection";
import { SecuritySection } from "./SecuritySection";
import { AppsSection } from "./AppsSection";
import { AmbientSection } from "./AmbientSection";
import { IntegrationsSection } from "./IntegrationsSection";

export const SETTINGS_SECTION_VIEWS: Record<SettingsSectionId, ComponentType> =
    {
        general: GeneralSection,
        audio: AudioSection,
        video: VideoSection,
        streaming: StreamingSection,
        notifications: NotificationsSection,
        ambient: AmbientSection,
        performance: PerformanceSection,
        members: MembersSection,
        guests: GuestsSection,
        conversations: ConversationsSection,
        security: SecuritySection,
        apps: AppsSection,
        integrations: IntegrationsSection,
    };
