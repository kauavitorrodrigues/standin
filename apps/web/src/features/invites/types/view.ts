import type { ReactNode } from "react";
import type {
    INVITE_TABS,
    MANAGE_TARGETS,
    MEMBER_INVITE_MODES,
} from "../consts/view";

export type ManageTarget = (typeof MANAGE_TARGETS)[keyof typeof MANAGE_TARGETS];

export type InviteTab = (typeof INVITE_TABS)[keyof typeof INVITE_TABS];

export type MemberInviteMode =
    (typeof MEMBER_INVITE_MODES)[keyof typeof MEMBER_INVITE_MODES];

// What a list shows for each of its states.
export type ListContentProps = {
    isLoading: boolean;
    isError: boolean;
    isEmpty: boolean;
    emptyState: ReactNode;
    content: ReactNode;
};
