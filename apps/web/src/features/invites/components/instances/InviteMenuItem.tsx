import { UserPlusIcon } from "lucide-react";
import { DropdownMenuItem } from "@/components/ui/dropdown-menu";

type Props = { onOpen: () => void };

// The invite item of the space menu. Only the owner invites, so only the owner
// is offered it; the others answer guests from the settings.
export const InviteMenuItem = ({ onOpen }: Props) => (
    <DropdownMenuItem onClick={onOpen}>
        <UserPlusIcon />
        Convidar pessoas
    </DropdownMenuItem>
);
