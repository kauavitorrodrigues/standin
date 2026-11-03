import { TicketIcon, UsersIcon } from "lucide-react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { INVITE_TABS } from "../../consts/view";
import type { InviteTab } from "../../types";

const isInviteTab = (value: unknown): value is InviteTab =>
    value === INVITE_TABS.MEMBERS || value === INVITE_TABS.GUESTS;

type Props = {
    tab: InviteTab;
    onTabChange: (tab: InviteTab) => void;
};

// The Members / Guests segmented control of the invite screen.
export const InviteTabs = ({ tab, onTabChange }: Props) => (
    <Tabs
        value={tab}
        onValueChange={(value) => {
            if (isInviteTab(value)) onTabChange(value);
        }}
    >
        <TabsList className="w-full rounded-xl p-1 group-data-horizontal/tabs:h-11">
            <TabsTrigger
                value={INVITE_TABS.MEMBERS}
                icon={UsersIcon}
                className="gap-2 rounded-lg px-3 text-sm transition-none"
            >
                Membros
            </TabsTrigger>
            <TabsTrigger
                value={INVITE_TABS.GUESTS}
                icon={TicketIcon}
                className="gap-2 rounded-lg px-3 text-sm transition-none"
            >
                Convidados
            </TabsTrigger>
        </TabsList>
    </Tabs>
);
