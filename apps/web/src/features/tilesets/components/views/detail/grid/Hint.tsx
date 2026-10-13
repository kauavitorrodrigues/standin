import { InfoIcon } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { TilesetGridMismatch } from "./Mismatch";

type Props = {
    // Nothing to say until the grid typed differs from the saved one.
    show: boolean;
    // The image divides into cells with the margin and the spacing typed.
    fits: boolean;
    // The picker is open, and it says why the grid does not fit by itself.
    pickerOpen: boolean;
};

// What to know about the grid being typed, in an alert: what saving does, or
// why it cannot be saved (unless the picker, which is open, already says it).
export const TilesetGridHint = ({ show, fits, pickerOpen }: Props) => {
    if (!show) return null;

    if (!fits) return <TilesetGridMismatch show={!pickerOpen} />;

    return (
        <Alert>
            <InfoIcon />
            <AlertDescription>
                A folha mostra a grade digitada, e ela é salva junto com as
                categorias. As categorias seguem o número de cada tile, e o que
                ficar além do último tile se perde ao salvar.
            </AlertDescription>
        </Alert>
    );
};
