import { ArmchairIcon, FootprintsIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    VARIANT_EDITORS,
    type VariantEditor,
} from "@/features/assets/consts/variantEditors";
import { getToggleVariant } from "@/features/assets/utils/getToggleVariant";

type Props = {
    value: VariantEditor;
    onChange: (editor: VariantEditor) => void;
    // What the footprint tab says it holds, like "2 × 1".
    footprint: string;
    seatCount: number;
    // The seats are marked on the piece, so they wait for it to exist.
    seatsDisabled?: boolean;
};

const getSeatsTitle = (disabled: boolean) => {
    if (!disabled) return undefined;
    return "Marque o recorte da peça primeiro";
};

// Which editor of a chair is open, floating at the top of the image. Each tab says
// what it holds so far, so nothing needs a line of its own.
export const EditorTabs = ({
    value,
    onChange,
    footprint,
    seatCount,
    seatsDisabled = false,
}: Props) => (
    <div className="flex gap-1">
        <Button
            type="button"
            size="sm"
            variant={getToggleVariant(value === VARIANT_EDITORS.FOOTPRINT)}
            onClick={() => onChange(VARIANT_EDITORS.FOOTPRINT)}
        >
            <FootprintsIcon />
            Pegada
            <span className="text-muted-foreground">{footprint}</span>
        </Button>
        <Button
            type="button"
            size="sm"
            variant={getToggleVariant(value === VARIANT_EDITORS.SEATS)}
            disabled={seatsDisabled}
            title={getSeatsTitle(seatsDisabled)}
            onClick={() => onChange(VARIANT_EDITORS.SEATS)}
        >
            <ArmchairIcon />
            Assentos
            <span className="text-muted-foreground">{seatCount}</span>
        </Button>
    </div>
);
