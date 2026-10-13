import { useState, type ReactNode } from "react";
import { useWatch, type UseFormReturn } from "react-hook-form";
import { EditorCanvas } from "@/features/assets/components/views/editor/EditorCanvas";
import { InlineError } from "@/features/assets/components/views/form/InlineError";
import { EditorToolbar } from "@/features/assets/components/views/editor/EditorToolbar";
import { SeatMarkers } from "@/features/assets/components/views/editor/SeatMarkers";
import { DEFAULT_ZOOM, type Zoom } from "@/features/assets/consts/editorZoom";
import { useObjectUrl } from "@/features/assets/hooks/useObjectUrl";
import { useSeatMarkers } from "@/features/assets/hooks/useSeatMarkers";
import { useVariantGeometry } from "@/features/assets/hooks/useVariantGeometry";
import type { AddVariantFormValues } from "@/features/assets/types/addVariantForm";

type Props = {
    form: UseFormReturn<AddVariantFormValues>;
    file: File;
    frameCount: number;
    solid: boolean;
    disabled: boolean;
    selected: number | null;
    onSelect: (index: number | null) => void;
    leading: ReactNode;
};

// The editor of the seats of a chair: separate from the footprint editor,
// because it marks points instead of cells. The footprint stays drawn as a
// reference, and the list of the seats lives beside the fields. Nothing here
// is typed, the offsets come from the clicks.
export const SeatsEditor = ({
    form,
    file,
    frameCount,
    solid,
    disabled,
    selected,
    onSelect,
    leading,
}: Props) => {
    const url = useObjectUrl(file);
    const { size, crop, frame, footprint } = useVariantGeometry(
        form,
        file,
        frameCount
    );
    const [zoom, setZoom] = useState<Zoom>(DEFAULT_ZOOM);
    const seats = useWatch({ control: form.control, name: "seats" });
    const error = form.formState.errors.seats?.message;

    const markers = useSeatMarkers({
        seats,
        frame,
        zoom,
        selected,
        onSelect,
        onChange: (next) => {
            form.setValue("seats", next);
            form.clearErrors("seats");
        },
    });

    return (
        <div className="flex h-full flex-col gap-3">
            <EditorToolbar
                leading={leading}
                zoom={zoom}
                canClear={seats.length > 0}
                disabled={disabled}
                clearLabel="Limpar assentos"
                onZoomChange={setZoom}
                onClear={markers.clear}
                onRemoveImage={() => form.setValue("image", [])}
            />
            <EditorCanvas
                url={url}
                size={size}
                zoom={zoom}
                crop={crop}
                frame={frame}
                footprint={footprint}
                solid={solid}
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
            <p className="text-muted-foreground rounded-lg border border-dashed px-3 py-2.5 text-sm">
                Clique no frame para marcar onde o avatar senta. Arraste um
                assento para ajustar e escolha para onde ele fica virado.
            </p>
            <InlineError message={error} />
        </div>
    );
};
