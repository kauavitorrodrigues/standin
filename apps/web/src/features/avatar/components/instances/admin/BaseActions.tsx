import { useState } from "react";
import { EllipsisVerticalIcon } from "lucide-react";
import type { AvatarBase } from "@standin/contracts";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { BaseAction } from "../../../types/parts";
import { BaseDialogs } from "../../dialogs/admin/BaseDialogs";
import { BaseMenuItems } from "../../views/admin/BaseMenuItems";

type Props = { base: AvatarBase };

// The menu of a base and the dialog it opens.
export const BaseActions = ({ base }: Props) => {
    const [action, setAction] = useState<BaseAction>(null);
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
                    <span className="sr-only">Ações da base</span>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-60">
                    <BaseMenuItems base={base} onSelect={setAction} />
                </DropdownMenuContent>
            </DropdownMenu>
            <BaseDialogs base={base} action={action} onOpenChange={close} />
        </>
    );
};
