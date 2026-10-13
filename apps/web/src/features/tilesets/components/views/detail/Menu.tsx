import { EllipsisVerticalIcon, PencilIcon, Trash2Icon } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

type Props = {
    onRename: () => void;
    onDelete: () => void;
};

// The less frequent actions of the editor of a tileset: rename and delete.
export const TilesetEditorMenu = ({ onRename, onDelete }: Props) => (
    <DropdownMenu>
        <DropdownMenuTrigger render={<Button variant="outline" size="icon" />}>
            <EllipsisVerticalIcon />
            <span className="sr-only">Ações do tileset</span>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-40">
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
