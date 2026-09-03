import type { ComponentType } from "react";
import { ListHeaderActions } from "@/features/chat/components/layout/ListHeaderActions";
import { ThreadHeaderActions } from "@/features/chat/components/layout/ThreadHeaderActions";
import { ParticipantsHeaderActions } from "@/features/chat/components/layout/ParticipantsHeaderActions";
import type { HeaderActionsProps } from "@/features/chat/components/layout/HeaderActionsProps";
import {
    CHAT_SIDEBAR_VIEWS,
    type ChatSidebarView,
} from "@/features/chat/consts/sidebarView";

export const HEADER_ACTIONS_BY_VIEW: Record<
    ChatSidebarView,
    ComponentType<HeaderActionsProps>
> = {
    [CHAT_SIDEBAR_VIEWS.LIST]: ListHeaderActions,
    [CHAT_SIDEBAR_VIEWS.THREAD]: ThreadHeaderActions,
    [CHAT_SIDEBAR_VIEWS.PARTICIPANTS]: ParticipantsHeaderActions,
};
