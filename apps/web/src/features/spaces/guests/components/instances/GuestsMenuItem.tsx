import { UsersRoundIcon } from "lucide-react";
import { DropdownMenuItem } from "@/components/ui/dropdown-menu";

type Props = { onOpen: () => void };

// The Guests item of the space menu. Every member is a host and sees it; what
// only the owner can do is inside the dialog.
export const GuestsMenuItem = ({ onOpen }: Props) => (
    <DropdownMenuItem onClick={onOpen}>
        <UsersRoundIcon />
        Convidados
    </DropdownMenuItem>
);
