import { ImageIcon, ImageMinusIcon, PencilIcon } from "lucide-react";
import type { AvatarCategory } from "@standin/contracts";
import { DropdownMenuItem } from "@/components/ui/dropdown-menu";
import type { CategoryAction } from "../../../types/parts";

type Props = {
    category: AvatarCategory;
    onSelect: (action: CategoryAction) => void;
};

const RemoveImageItem = ({ category, onSelect }: Props) => {
    if (category.previewUrl === null) return null;

    return (
        <DropdownMenuItem onClick={() => onSelect("removePreview")}>
            <ImageMinusIcon />
            Remover a imagem
        </DropdownMenuItem>
    );
};

export const CategoryMenuItems = ({ category, onSelect }: Props) => (
    <>
        <DropdownMenuItem onClick={() => onSelect("edit")}>
            <PencilIcon />
            Editar
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => onSelect("replacePreview")}>
            <ImageIcon />
            Trocar a imagem
        </DropdownMenuItem>
        <RemoveImageItem category={category} onSelect={onSelect} />
    </>
);
