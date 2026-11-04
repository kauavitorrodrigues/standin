import { useState } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { usePermission } from "@/features/auth/hooks/usePermission";
import { INVITE_TABS } from "../../consts/view";
import type { InviteTab, ManageTarget } from "../../types";
import { InviteScreen } from "../instances/InviteScreen";
import { InviteDialogBody } from "../layout/InviteDialogBody";
import { InviteDialogHeader } from "../layout/InviteDialogHeader";

type Props = {
    organizationId: string;
    // The space the dialog was opened in. Null opened from the organization
    // switcher, where there are no guests to invite.
    spaceId: string | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    // The people are managed in the settings of a space: the dialog sends
    // there. Absent outside a space, where the rows that go there are hidden.
    onManage?: (target: ManageTarget) => void;
};

// One place to bring people in: members and guests in tabs, the fixed links,
// and the invitations by e-mail with a desk. Managing who is already in lives
// in the settings of the space.
export const InviteCollaboratorsDialog = ({
    organizationId,
    spaceId,
    open,
    onOpenChange,
    onManage,
}: Props) => {
    const [tab, setTab] = useState<InviteTab>(INVITE_TABS.MEMBERS);
    // A person who is not the owner is here only because the space lets
    // members invite, and gets the guest link alone.
    const isOwner = usePermission("update", "space");

    const manage =
        onManage &&
        ((target: ManageTarget) => {
            onOpenChange(false);
            onManage(target);
        });

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-h-[85vh] gap-0 overflow-y-auto p-0 sm:max-w-xl">
                <InviteDialogHeader title="Convidar colaboradores" />
                <InviteDialogBody>
                    <InviteScreen
                        organizationId={organizationId}
                        spaceId={spaceId}
                        tab={tab}
                        onTabChange={setTab}
                        onManage={manage}
                        isOwner={isOwner}
                    />
                </InviteDialogBody>
            </DialogContent>
        </Dialog>
    );
};
