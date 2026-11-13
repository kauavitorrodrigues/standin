import { toast } from "@/components/ui/toast";
import { useSocketEvent } from "@/features/realtime/hooks/useSocketEvent";
import { OrganizationMessages } from "../consts/messages";
import { useDropOrganization } from "./useDropOrganization";

// This person is no longer a member, whoever ended it and on whichever tab or
// device. This is the one place that tells them and drops the organization:
// the leave dialog may be gone by the time its request answers, so it does
// neither.
export const useMemberRemovedNotice = () => {
    const drop = useDropOrganization();

    useSocketEvent("organization:member-removed", (removed) => {
        switch (removed.reason) {
            case "removed":
                toast.add({
                    title: OrganizationMessages.accessRemoved(
                        removed.organizationName
                    ),
                    type: "warning",
                });
                break;
            case "left":
                toast.add({
                    title: OrganizationMessages.LEFT,
                    type: "success",
                });
                break;
        }
        void drop(removed.organizationId);
    });
};
