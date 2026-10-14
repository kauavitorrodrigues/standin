import { useMemo } from "react";
import type { MapTemplatePreview } from "@standin/contracts";
import { MapPreviewCanvas } from "@/features/game/preview/MapPreviewCanvas";
import { toPreviewMapData } from "@/features/game/preview/toPreviewMapData";

const LoadedPreview = ({ preview }: { preview: MapTemplatePreview }) => {
    const map = useMemo(() => toPreviewMapData(preview), [preview]);

    return (
        <div className="animate-in fade-in absolute inset-0 duration-300">
            <MapPreviewCanvas map={map} />
        </div>
    );
};

// The map drawn from a public preview. Nothing until it arrives, so what is
// underneath (the photo or the grid) is what is seen meanwhile.
export const LivePreview = ({
    preview,
}: {
    preview: MapTemplatePreview | undefined;
}) => {
    if (!preview) return null;

    return <LoadedPreview preview={preview} />;
};
