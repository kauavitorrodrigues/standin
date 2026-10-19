import { Link } from "@tanstack/react-router";
import {
    EyeIcon,
    ImageIcon,
    ImageUpIcon,
    PaletteIcon,
    PencilIcon,
    Trash2Icon,
} from "lucide-react";
import type { AvatarPartRow } from "@standin/contracts";
import {
    DropdownMenuItem,
    DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
    AVATAR_ADMIN_PATHS,
    AVATAR_NEW_KINDS,
} from "../../../consts/avatarNew";
import type { PartAction } from "../../../types/parts";
import { canAddVariation } from "../../../utils/admin/canAddVariation";

type Props = {
    part: AvatarPartRow;
    onSelect: (action: PartAction) => void;
};

const VariationItem = ({ part }: Pick<Props, "part">) => {
    if (!canAddVariation(part)) return null;

    return (
        <DropdownMenuItem
            render={
                <Link
                    to={AVATAR_ADMIN_PATHS.NEW}
                    search={{
                        kind: AVATAR_NEW_KINDS.COLOR,
                        partId: part.id,
                    }}
                />
            }
        >
            <PaletteIcon />
            Adicionar cor
        </DropdownMenuItem>
    );
};

// The entries of the menu of a row.
export const PartMenuItems = ({ part, onSelect }: Props) => {
    return (
        <>
            <DropdownMenuItem onClick={() => onSelect("preview")}>
                <EyeIcon />
                Pré-visualizar
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onSelect("edit")}>
                <PencilIcon />
                Editar
            </DropdownMenuItem>
            <VariationItem part={part} />
            <DropdownMenuItem onClick={() => onSelect("replaceFront")}>
                <ImageUpIcon />
                Trocar o sprite
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onSelect("replacePreview")}>
                <ImageIcon />
                Trocar a imagem da lista
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
                variant="destructive"
                onClick={() => onSelect("delete")}
            >
                <Trash2Icon />
                Excluir
            </DropdownMenuItem>
        </>
    );
};
