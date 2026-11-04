import { UserPlusIcon } from "lucide-react";
import { DropdownMenuItem } from "@/components/ui/dropdown-menu";

type Props = { onOpen: () => void };

// The invite item of the space menu. The owner is always offered it, a member
// only when the space lets members invite.
export const InviteMenuItem = ({ onOpen }: Props) => (
    <DropdownMenuItem onClick={onOpen}>
        <UserPlusIcon />
        Convidar pessoas
    </DropdownMenuItem>
);
