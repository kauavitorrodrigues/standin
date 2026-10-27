import { SlidersHorizontalIcon } from "lucide-react";
import { DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { usePermission } from "@/features/auth/hooks/usePermission";

type Props = { onOpen: () => void };

// The server only lets the owner save, so only the owner sees the item.
export const SpaceSettingsMenuItem = ({ onOpen }: Props) => {
    const isOwner = usePermission("update", "space");

    if (!isOwner) return null;

    return (
        <DropdownMenuItem onClick={onOpen}>
            <SlidersHorizontalIcon />
            Configurações do espaço
        </DropdownMenuItem>
    );
};
