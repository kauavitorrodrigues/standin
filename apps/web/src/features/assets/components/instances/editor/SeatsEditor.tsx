import { useState, type ReactNode } from "react";
import { cn } from "@/lib/utils";
import { EditorCanvas } from "@/features/assets/components/views/editor/EditorCanvas";
import { SeatsSidePanel } from "@/features/assets/components/views/editor/SeatsSidePanel";
import { EditorStage } from "@/features/assets/components/views/editor/EditorStage";
import { SeatsToolbar } from "@/features/assets/components/views/editor/SeatsToolbar";
import { SeatMarkers } from "@/features/assets/components/views/editor/SeatMarkers";
import { DEFAULT_ZOOM, type Zoom } from "@/features/assets/consts/editorZoom";
import { useImageSize } from "@/features/assets/queries/useImageSize";
import { useObjectUrl } from "@/features/assets/hooks/useObjectUrl";
import { useSeatMarkers } from "@/features/assets/hooks/useSeatMarkers";
import type { FootprintMaskValue } from "@/features/assets/types/footprintMask";
import type { Seat } from "@/features/assets/types/seat";
import type { Crop, Footprint } from "@/features/assets/types/spriteGeometry";
import { getFrameCrop } from "@/features/assets/utils/spriteGeometry";

type Props = {
    file: File;
    // The piece inside the image, the whole image for a variation.
    crop: Crop;
    frameCount: number;
    footprint: Footprint;
    mask: FootprintMaskValue;
    solid: boolean;
    seats: Seat[];
    onChange: (seats: Seat[]) => void;
    error: string | undefined;
    disabled: boolean;
    selected: number | null;
    onSelect: (index: number | null) => void;
    onRemoveImage: () => void;
    leading: ReactNode;
    // Floats at the bottom of the image, like the buttons that close the form.
    actions?: ReactNode;
    // What goes in the column beside the image, under the hint: the list of
    // the seats, when the page has room for it.
    side?: ReactNode;
    // Takes all the height of the column the editor is in, instead of a
    // limit, like the page of a new asset does.
    fill?: boolean;
};

// The editor of the seats of a chair: separate from the footprint editor,
// because it marks points instead of cells. The footprint stays drawn as a
// reference, and the list of the seats lives beside it. Nothing here is
// typed, the offsets come from the clicks.
export const SeatsEditor = ({
    file,
    crop,
    frameCount,
    footprint,
    mask,
    solid,
    seats,
    onChange,
    error,
    disabled,
    selected,
    onSelect,
    onRemoveImage,
    leading,
    actions,
    side,
    fill = false,
}: Props) => {
    const url = useObjectUrl(file);
    const { data: size } = useImageSize(file);
    const frame = getFrameCrop(crop, frameCount);
    const [zoom, setZoom] = useState<Zoom>(DEFAULT_ZOOM);

    const markers = useSeatMarkers({
        seats,
        frame,
        zoom,
        selected,
        onSelect,
        onChange,
    });

    return (
        <div className="flex h-full min-h-0 flex-1 flex-col gap-3">
            <div className="flex min-h-0 flex-1 gap-3">
                <EditorStage
                    zoom={zoom}
                    onZoomChange={setZoom}
                    leading={leading}
                    actions={actions}
                    className={cn("flex-1", fill && "max-h-none")}
                >
                    <EditorCanvas
                        url={url}
                        size={size}
                        zoom={zoom}
                        crop={crop}
                        frame={frame}
                        footprint={footprint}
                        mask={mask}
                        solid={solid}
                        byCells={frameCount <= 1}
                        className="flex-1"
                        pointerHandlers={markers.pointerHandlers}
                    >
                        <SeatMarkers
                            seats={seats}
                            frame={frame}
                            zoom={zoom}
                            selected={selected}
                        />
                    </EditorCanvas>
                    <SeatsToolbar
                        canClear={seats.length > 0}
                        disabled={disabled}
                        onClear={markers.clear}
                        onRemoveImage={onRemoveImage}
                    />
                </EditorStage>
                <SeatsSidePanel error={error}>{side}</SeatsSidePanel>
            </div>
        </div>
    );
};
