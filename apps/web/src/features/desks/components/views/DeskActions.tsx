import { EllipsisVerticalIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DeskIcon } from "@/components/icons/DeskIcon";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

type DeskActionsProps = {
    disabled: boolean;
    onRelease: () => void;
};

// The actions button of the profile card, with the options of a desk.
export const DeskActions = ({ disabled, onRelease }: DeskActionsProps) => (
    <DropdownMenu>
        <DropdownMenuTrigger
            render={
                <Button
                    type="button"
                    icon={EllipsisVerticalIcon}
                    size="icon-lg"
                    variant="secondary"
                    aria-label="Ações"
                />
            }
        />
        <DropdownMenuContent
            side="bottom"
            align="end"
            sideOffset={11}
            className="w-50"
        >
            <DropdownMenuItem disabled={disabled} onClick={onRelease}>
                <DeskIcon />
                Liberar minha mesa
            </DropdownMenuItem>
        </DropdownMenuContent>
    </DropdownMenu>
);
