import { InfoIcon, SettingsIcon, UsersRoundIcon } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { cn } from "@/lib/utils";
import { INVITE_TABS, MANAGE_TARGETS } from "../../consts/view";
import type { InviteTab, ManageTarget } from "../../types";
import { FooterRow } from "../views/FooterRow";
import { InviteTabs } from "../views/InviteTabs";
import { NoSpaceNotice } from "../views/NoSpaceNotice";
import { GuestInviteCard } from "./GuestInviteCard";
import { MemberInviteCard } from "./MemberInviteCard";

type Props = {
    organizationId: string;
    // Null outside a space: there are no guests to invite then.
    spaceId: string | null;
    tab: InviteTab;
    onTabChange: (tab: InviteTab) => void;
    // Opens the settings on the section that manages the people.
    onManage?: (target: ManageTarget) => void;
    // The owner brings in members and guests. A member the space lets invite
    // only gets the guest link.
    isOwner: boolean;
};

// One short line each, so the dialog keeps its height from tab to tab.
const DESCRIPTIONS: Record<InviteTab, string> = {
    [INVITE_TABS.MEMBERS]:
        "Membros têm mesa própria e podem decorar o escritório.",
    [INVITE_TABS.GUESTS]:
        "Convidados são admitidos por alguém e não reservam mesa.",
};

// The cards of both tabs share one grid cell, so the strip is as tall as the
// taller one and the dialog does not change height when the tab does. The one
// that is not open is transparent and inert. Not `invisible`: visibility is
// inherited, so buttons with a transition would linger for a few frames.
const TabCards = ({
    tab,
    organizationId,
    spaceId,
}: Pick<Props, "tab" | "organizationId" | "spaceId">) => (
    <div className="grid">
        <div
            inert={tab !== INVITE_TABS.MEMBERS}
            className={cn(
                "col-start-1 row-start-1",
                tab !== INVITE_TABS.MEMBERS && "pointer-events-none opacity-0"
            )}
        >
            <MemberInviteCard
                organizationId={organizationId}
                spaceId={spaceId}
            />
        </div>
        <div
            inert={tab !== INVITE_TABS.GUESTS}
            className={cn(
                "col-start-1 row-start-1",
                tab !== INVITE_TABS.GUESTS && "pointer-events-none opacity-0"
            )}
        >
            {spaceId ? (
                <GuestInviteCard spaceId={spaceId} isOwner />
            ) : (
                <NoSpaceNotice />
            )}
        </div>
    </div>
);

// The row that goes on to manage the people of the tab, when there is
// something to manage.
const ManageRow = ({
    tab,
    spaceId,
    onManage,
}: Pick<Props, "tab" | "spaceId" | "onManage">) => {
    if (!onManage) return null;
    if (tab === INVITE_TABS.MEMBERS) {
        return (
            <FooterRow
                icon={<UsersRoundIcon />}
                label="Gerenciar membros"
                onClick={() => onManage(MANAGE_TARGETS.MEMBERS)}
            />
        );
    }
    if (!spaceId) return null;
    return (
        <FooterRow
            icon={<SettingsIcon />}
            label="Gerenciar convidados"
            onClick={() => onManage(MANAGE_TARGETS.GUESTS)}
        />
    );
};

// The footer of the dialog: its border runs edge to edge, as a section apart.
const ManageSection = (props: Pick<Props, "tab" | "spaceId" | "onManage">) => {
    const row = ManageRow(props);
    if (!row) return null;
    return <div className="px-2 py-1.5">{row}</div>;
};

// What a member sees: the link of the guests and nothing of the members, whose
// link and e-mails stay with the owner.
const MemberScreen = ({
    spaceId,
    onManage,
}: Pick<Props, "spaceId" | "onManage">) => (
    <div className="flex flex-col">
        <div className="px-4 pb-4">
            <Alert role="note">
                <InfoIcon />
                <AlertDescription>
                    {DESCRIPTIONS[INVITE_TABS.GUESTS]}
                </AlertDescription>
            </Alert>
        </div>
        <div className="border-y bg-muted/20 p-4">
            {spaceId ? (
                <GuestInviteCard spaceId={spaceId} isOwner={false} />
            ) : (
                <NoSpaceNotice />
            )}
        </div>
        <ManageSection
            tab={INVITE_TABS.GUESTS}
            spaceId={spaceId}
            onManage={onManage}
        />
    </div>
);

// The main screen of the dialog: Members and Guests tabs, the card of the tab
// and the row that goes on to manage the people.
export const InviteScreen = ({
    organizationId,
    spaceId,
    tab,
    onTabChange,
    onManage,
    isOwner,
}: Props) => {
    if (!isOwner) return <MemberScreen spaceId={spaceId} onManage={onManage} />;

    return (
        <div className="flex flex-col">
            <div className="flex flex-col gap-3 px-4 pb-4">
                <InviteTabs tab={tab} onTabChange={onTabChange} />
                <Alert role="note">
                    <InfoIcon />
                    <AlertDescription>{DESCRIPTIONS[tab]}</AlertDescription>
                </Alert>
            </div>
            <div className="border-y bg-muted/20 p-4">
                <TabCards
                    tab={tab}
                    organizationId={organizationId}
                    spaceId={spaceId}
                />
            </div>
            <ManageSection tab={tab} spaceId={spaceId} onManage={onManage} />
        </div>
    );
};
