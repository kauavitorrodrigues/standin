import { SparklesIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

type Props = {
    // The footer only has something to do once a sheet was chosen.
    show: boolean;
    canCreate: boolean;
    isSubmitting: boolean;
    onCancel: () => void;
};

// Cancel and create. The one that places them decides how they sit.
export const TilesetFormFooter = ({
    show,
    canCreate,
    isSubmitting,
    onCancel,
}: Props) => {
    if (!show) return null;

    return (
        <>
            <Button
                type="button"
                variant="outline"
                disabled={isSubmitting}
                onClick={onCancel}
            >
                Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting || !canCreate}>
                <SparklesIcon />
                Criar tileset
            </Button>
        </>
    );
};
