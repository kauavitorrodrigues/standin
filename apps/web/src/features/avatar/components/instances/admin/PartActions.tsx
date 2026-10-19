import { useState } from "react";
import { EllipsisVerticalIcon } from "lucide-react";
import type { AvatarPartRow } from "@standin/contracts";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { PartAction } from "../../../types/parts";
import { PartDialogs } from "../../dialogs/admin/PartDialogs";
import { PartMenuItems } from "../../views/admin/PartMenuItems";

type Props = { part: AvatarPartRow };

// The menu of a row of a part and the dialog it opens.
export const PartActions = ({ part }: Props) => {
    const [action, setAction] = useState<PartAction>(null);
    const close = (next: boolean) => {
        if (!next) setAction(null);
    };

    return (
        <>
            <DropdownMenu>
                <DropdownMenuTrigger
                    render={<Button variant="ghost" size="icon-sm" />}
                >
                    <EllipsisVerticalIcon />
                    <span className="sr-only">Ações da peça</span>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-60">
                    <PartMenuItems part={part} onSelect={setAction} />
                </DropdownMenuContent>
            </DropdownMenu>
            <PartDialogs part={part} action={action} onOpenChange={close} />
        </>
    );
};
