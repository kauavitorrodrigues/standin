import {
    ImageIcon,
    ImageMinusIcon,
    ImageUpIcon,
    PencilIcon,
    StarIcon,
    Trash2Icon,
} from "lucide-react";
import { AVATAR_BASE_KINDS } from "@standin/contracts";
import type { AvatarBase } from "@standin/contracts";
import {
    DropdownMenuItem,
    DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import type { BaseAction } from "../../../types/parts";

type Props = {
    base: AvatarBase;
    onSelect: (action: BaseAction) => void;
};

const DefaultItemText = ({ base }: Pick<Props, "base">) => {
    switch (base.kind) {
        case AVATAR_BASE_KINDS.BODY:
            return "Tornar padrão";
        case AVATAR_BASE_KINDS.MANNEQUIN:
            return "Usar na prévia";
    }
};

const DefaultItem = ({ base, onSelect }: Props) => {
    if (base.isDefault) return null;

    return (
        <DropdownMenuItem onClick={() => onSelect("setDefault")}>
            <StarIcon />
            <DefaultItemText base={base} />
        </DropdownMenuItem>
    );
};

const RemoveImageItem = ({ base, onSelect }: Props) => {
    if (base.previewUrl === null) return null;

    return (
        <DropdownMenuItem onClick={() => onSelect("removePreview")}>
            <ImageMinusIcon />
            Remover a imagem da lista
        </DropdownMenuItem>
    );
};

// The base in use cannot be deleted, so it has no entry for it. Another one
// of its kind has to take the place first.
const DeleteItem = ({ base, onSelect }: Props) => {
    if (base.isDefault) return null;

    return (
        <>
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

export const BaseMenuItems = ({ base, onSelect }: Props) => (
    <>
        <DropdownMenuItem onClick={() => onSelect("edit")}>
            <PencilIcon />
            Editar
        </DropdownMenuItem>
        <DefaultItem base={base} onSelect={onSelect} />
        <DropdownMenuItem onClick={() => onSelect("replaceImage")}>
            <ImageUpIcon />
            Trocar o sprite
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => onSelect("replacePreview")}>
            <ImageIcon />
            Trocar a imagem da lista
        </DropdownMenuItem>
        <RemoveImageItem base={base} onSelect={onSelect} />
        <DeleteItem base={base} onSelect={onSelect} />
    </>
);
