import type { ComponentType } from "react";
import { ListBody } from "@/features/chat/components/layout/ListBody";
import { ThreadBody } from "@/features/chat/components/layout/ThreadBody";
import { ParticipantsBody } from "@/features/chat/components/layout/ParticipantsBody";
import type { SidebarBodyProps } from "@/features/chat/components/layout/SidebarBodyProps";
import {
    CHAT_SIDEBAR_VIEWS,
    type ChatSidebarView,
} from "@/features/chat/consts/sidebarView";

export const BODY_BY_VIEW: Record<
    ChatSidebarView,
    ComponentType<SidebarBodyProps>
> = {
    [CHAT_SIDEBAR_VIEWS.LIST]: ListBody,
    [CHAT_SIDEBAR_VIEWS.THREAD]: ThreadBody,
    [CHAT_SIDEBAR_VIEWS.PARTICIPANTS]: ParticipantsBody,
};
