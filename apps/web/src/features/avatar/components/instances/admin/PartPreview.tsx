import { AlertCircle, Loader2 } from "lucide-react";
import type { AvatarPartRow } from "@standin/contracts";
import { usePartPreview } from "../../../hooks/admin/usePartPreview";
import { AvatarPreviewCanvas } from "../AvatarPreviewCanvas";

type Props = { part: AvatarPartRow };

// The row on the default base. Clicking the avatar, or pressing an arrow key,
// turns it through the four directions.
export const PartPreview = ({ part }: Props) => {
    const { layers, isLoading, isError } = usePartPreview({ row: part });

    if (isError) {
        return (
            <p className="text-destructive flex items-center gap-2 text-sm">
                <AlertCircle className="size-4" />
                Não foi possível carregar as imagens da peça.
            </p>
        );
    }
    if (isLoading || layers === null) {
        return (
            <div className="flex justify-center p-8">
                <Loader2 className="size-6 animate-spin text-muted-foreground" />
            </div>
        );
    }

    return (
        <AvatarPreviewCanvas layers={layers} className="mx-auto w-full max-w-sm" />
    );
};
