import { useState } from "react";
import type { Control } from "react-hook-form";
import { ChevronDownIcon } from "lucide-react";
import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { NumberFormField } from "@/components/fields/NumberFormField";
import type { CreateTilesetFormValues } from "../../types/createForm";

type Props = {
    control: Control<CreateTilesetFormValues>;
    // The grid does not fit, so the fields that fix it have to be in sight.
    hasGridError: boolean;
    disabled: boolean;
};

// The margin and the spacing of the sheet. They decide how the sheet is cut
// into tiles and many sheets need them, so they start open. They can be
// folded, but never while the grid does not fit.
export const AdvancedTilesetFields = ({
    control,
    hasGridError,
    disabled,
}: Props) => {
    const [open, setOpen] = useState(true);

    return (
        <Collapsible open={open || hasGridError} onOpenChange={setOpen}>
            <CollapsibleTrigger className="text-muted-foreground hover:text-foreground flex items-center gap-1 text-sm">
                <ChevronDownIcon className="size-4" />
                Margem e espaçamento
            </CollapsibleTrigger>
            <CollapsibleContent>
                <div className="grid grid-cols-2 gap-2 pt-3">
                    <NumberFormField
                        control={control}
                        name="margin"
                        label="Margem"
                        hint="Pixels entre a borda da imagem e a primeira célula."
                        min={0}
                        disabled={disabled}
                    />
                    <NumberFormField
                        control={control}
                        name="spacing"
                        label="Espaçamento"
                        hint="Pixels entre uma célula e a seguinte."
                        min={0}
                        disabled={disabled}
                    />
                </div>
            </CollapsibleContent>
        </Collapsible>
    );
};
