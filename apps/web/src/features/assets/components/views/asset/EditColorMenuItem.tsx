import { PaletteIcon } from "lucide-react";
import { DropdownMenuItem } from "@/components/ui/dropdown-menu";

type Props = {
    // Only a variation that has a color can have it edited.
    show: boolean;
    onSelect: () => void;
};

export const EditColorMenuItem = ({ show, onSelect }: Props) => {
    if (!show) return null;

    return (
        <DropdownMenuItem onClick={onSelect}>
            <PaletteIcon />
            Editar cor
        </DropdownMenuItem>
    );
};
