import { TriangleAlertIcon } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { TILESET_VALIDATION_MESSAGES } from "../../../../consts/validationMessages";

type Props = {
    // The image does not divide into cells with the margin and the spacing
    // typed.
    show: boolean;
};

// Why the grid typed cannot be saved. It is shown inside the picker while it
// is open, so the margin and the spacing can be fixed with it in sight.
export const TilesetGridMismatch = ({ show }: Props) => {
    if (!show) return null;

    return (
        <Alert variant="destructive">
            <TriangleAlertIcon />
            <AlertDescription>
                {TILESET_VALIDATION_MESSAGES.GRID_MISMATCH}
            </AlertDescription>
        </Alert>
    );
};
