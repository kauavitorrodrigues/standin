import { useState } from "react";
import { EllipsisVerticalIcon, ImageUpIcon, Trash2Icon } from "lucide-react";
import type {
    LibraryFamilyDetail,
    LibraryFamilyVariant,
} from "@standin/contracts";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { VariantDialogs } from "@/features/assets/components/dialogs/VariantDialogs";
import { EditColorMenuItem } from "@/features/assets/components/views/asset/EditColorMenuItem";
import type { VariantAction } from "@/features/assets/types/variantActions";

type Props = {
    variant: LibraryFamilyVariant;
    family: Pick<LibraryFamilyDetail, "variants">;
};

// The menu that shows over a cell of the grid while it is hovered. A cell only
// changes its color and image, the fields of the family are edited from the
// header of the panel. The image can only be replaced while no map uses the
// variation.
export const VariantActions = ({ variant, family }: Props) => {
    const [action, setAction] = useState<VariantAction>(null);
    const close = (next: boolean) => {
        if (!next) setAction(null);
    };

    return (
        <>
            <DropdownMenu>
                <DropdownMenuTrigger
                    render={
                        <Button
                            variant="secondary"
                            size="icon-xs"
                            className="bg-background/70 hover:bg-background absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-0 backdrop-blur-sm group-focus-within/cell:opacity-100 group-hover/cell:opacity-100 data-popup-open:opacity-100"
                        />
                    }
                >
                    <EllipsisVerticalIcon />
                    <span className="sr-only">Ações da variação</span>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="center" className="w-50">
                    <EditColorMenuItem
                        show={variant.colorKey !== null}
                        onSelect={() => setAction("color")}
                    />
                    <DropdownMenuItem
                        disabled={variant.inUse}
                        onClick={() => setAction("image")}
                    >
                        <ImageUpIcon />
                        Trocar a imagem
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                        variant="destructive"
                        onClick={() => setAction("delete")}
                    >
                        <Trash2Icon />
                        Apagar
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
            <VariantDialogs
                variant={variant}
                family={family}
                action={action}
                onOpenChange={close}
            />
        </>
    );
};
