import { useState } from "react";
import { EllipsisVerticalIcon } from "lucide-react";
import type { AvatarCategory } from "@standin/contracts";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { CategoryAction } from "../../../types/parts";
import { CategoryDialogs } from "../../dialogs/admin/CategoryDialogs";
import { CategoryMenuItems } from "../../views/admin/CategoryMenuItems";

type Props = { category: AvatarCategory };

// The menu of a category and the dialog it opens.
export const CategoryActions = ({ category }: Props) => {
    const [action, setAction] = useState<CategoryAction>(null);
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
                    <span className="sr-only">Ações da categoria</span>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-52">
                    <CategoryMenuItems
                        category={category}
                        onSelect={setAction}
                    />
                </DropdownMenuContent>
            </DropdownMenu>
            <CategoryDialogs
                category={category}
                action={action}
                onOpenChange={close}
            />
        </>
    );
};
