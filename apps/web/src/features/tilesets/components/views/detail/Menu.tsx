import { PencilIcon, Trash2Icon } from "lucide-react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

type Props = {
    name: string;
    onRename: () => void;
    onDelete: () => void;
};

// The name of the tileset in the title bar. It opens rename and delete.
export const TilesetEditorMenu = ({ name, onRename, onDelete }: Props) => (
    <DropdownMenu>
        <DropdownMenuTrigger
            aria-label="Ações do tileset"
            className="hover:bg-accent min-w-0 cursor-pointer truncate rounded-md px-1.5 py-1"
        >
            {name}
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-40">
            <DropdownMenuItem onClick={onRename}>
                <PencilIcon />
                Renomear
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem variant="destructive" onClick={onDelete}>
                <Trash2Icon />
                Apagar
            </DropdownMenuItem>
        </DropdownMenuContent>
    </DropdownMenu>
);
