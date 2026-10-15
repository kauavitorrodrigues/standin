import type { ReactNode } from "react";
import { useWatch, type UseFormReturn } from "react-hook-form";
import { EditorTabs } from "@/features/assets/components/views/editor/EditorTabs";
import { SeatsEditor } from "@/features/assets/components/instances/editor/SeatsEditor";
import { SeatsList } from "@/features/assets/components/instances/editor/SeatsList";
import { ASSET_ACTION_BEHAVIOR } from "@/features/assets/consts/actionBehavior";
import { VARIANT_EDITORS } from "@/features/assets/consts/variantEditors";
import { useAssetSeats } from "@/features/assets/hooks/useAssetSeats";
import { getActiveEditor } from "@/features/assets/utils/getActiveEditor";
import { keepSeatsInFrame } from "@/features/assets/utils/seatList";
import { SpriteEditor } from "@/features/assets/components/instances/editor/SpriteEditor";
import { NO_CROP, NO_FOOTPRINT } from "@/features/assets/consts/spriteGeometry";
import { useResetMarksOnAnimation } from "@/features/assets/hooks/useResetMarksOnAnimation";
import {
    NO_FOOTPRINT_MASK,
    NO_SOLID_MASK,
} from "@/features/assets/consts/footprintMask";
import type {
    FootprintMasks,
    FootprintTile,
} from "@/features/assets/types/footprintMask";
import { canHaveMask } from "@/features/assets/utils/footprintMask";
import type { CreateAssetFormValues } from "@/features/assets/types/createForm";
import type { Crop, Footprint } from "@/features/assets/types/spriteGeometry";
import { InlineError } from "@/features/assets/components/views/form/InlineError";
import { footprintFitsCrop } from "@/features/assets/utils/footprintFitsCrop";
import {
    getFrameCrop,
    hasCrop,
    hasFootprint,
} from "@/features/assets/utils/spriteGeometry";
import { getEditorFrameCount } from "@/features/assets/utils/getEditorFrameCount";
import { toggleTileMasks } from "@/features/assets/utils/solidMask";

type Props = {
    form: UseFormReturn<CreateAssetFormValues>;
    file: File;
    disabled: boolean;
    // The buttons that close the form, floating over the image.
    actions: ReactNode;
};

// The visual editor tied to the form: the crop and the footprint it marks
// are kept in the fields of the form, so the summary, the validation and the
// upload read them from there. For an animated asset the way the strip
// plays sits right under the image, since it describes the image.
export const ImageFields = ({ form, file, disabled, actions }: Props) => {
    useResetMarksOnAnimation(form);
    const [cropX, cropY, cropW, cropH, footprintW, footprintH, offsetX] =
        useWatch({
            control: form.control,
            name: [
                "cropX",
                "cropY",
                "cropW",
                "cropH",
                "footprintW",
                "footprintH",
                "footprintOffsetX",
            ],
        });
    const crop: Crop = { x: cropX, y: cropY, w: cropW, h: cropH };
    const footprint: Footprint = {
        w: footprintW ?? NO_FOOTPRINT.w,
        h: footprintH ?? NO_FOOTPRINT.h,
        offsetX: offsetX ?? NO_FOOTPRINT.offsetX,
    };
    const [action, isAnimated, frameCount, solid, mask, solidMask] = useWatch({
        control: form.control,
        name: [
            "action",
            "isAnimated",
            "frameCount",
            "solid",
            "footprintMask",
            "footprintSolidMask",
        ],
    });

    const seatState = useAssetSeats(form);
    const editorFrameCount = getEditorFrameCount(isAnimated, frameCount);
    const activeEditor = getActiveEditor({
        action,
        picked: seatState.picked,
        hasCrop: hasCrop(crop),
    });

    const setCrop = (next: Crop) => {
        form.setValue("cropX", next.x);
        form.setValue("cropY", next.y);
        form.setValue("cropW", next.w);
        form.setValue("cropH", next.h);
        form.clearErrors("cropW");
    };
    // Seats are counted from the corner of the frame, so a new crop only keeps
    // the ones that still sit inside it.
    const keepSeats = (next: Crop) => {
        const frame = getFrameCrop(next, editorFrameCount);
        seatState.setSeats(keepSeatsInFrame(seatState.seats, frame));
        seatState.setSelected(null);
    };
    const setFootprint = (next: Footprint) => {
        form.setValue("footprintW", next.w);
        form.setValue("footprintH", next.h);
        form.setValue("footprintOffsetX", next.offsetX);
        form.setValue("footprintMask", NO_FOOTPRINT_MASK);
        form.setValue("footprintSolidMask", NO_SOLID_MASK);
        form.clearErrors(["footprintW", "footprintH"]);
    };
    // A new crop leaves the footprint alone, to be marked on its own. Only one
    // that no longer fits in the crop goes away.
    const markCrop = (next: Crop) => {
        setCrop(next);
        keepSeats(next);
        const frame = getFrameCrop(next, editorFrameCount);
        if (hasFootprint(footprint) && footprintFitsCrop(frame, footprint)) {
            return;
        }
        setFootprint(NO_FOOTPRINT);
    };
    const setMasks = (next: FootprintMasks) => {
        form.setValue("footprintMask", next.mask);
        form.setValue("footprintSolidMask", next.solidMask);
    };
    // Freeing a tile also empties the solid cells inside it.
    const toggleTile = (tile: FootprintTile) => {
        setMasks(
            toggleTileMasks(
                footprint,
                {
                    mask: form.getValues("footprintMask"),
                    solidMask: form.getValues("footprintSolidMask"),
                },
                tile
            )
        );
    };

    // Only a footprint of more than one tile of a still asset has a mask.
    const getTileToggle = () => {
        if (isAnimated || !canHaveMask(footprint)) return undefined;
        return toggleTile;
    };

    // The tabs only exist for a piece that has seats to mark.
    const getTabs = () => {
        if (!ASSET_ACTION_BEHAVIOR[action].hasSeats) return undefined;
        return (
            <EditorTabs
                value={activeEditor}
                onChange={seatState.setPicked}
                footprint={`${footprint.w} × ${footprint.h}`}
                seatCount={seatState.seats.length}
                seatsDisabled={!hasCrop(crop)}
            />
        );
    };

    const clearMarks = () => {
        setCrop(NO_CROP);
        setFootprint(NO_FOOTPRINT);
        seatState.clearSeats();
    };

    const renderEditor = () => {
        switch (activeEditor) {
            case VARIANT_EDITORS.SEATS:
                return (
                    <SeatsEditor
                        file={file}
                        crop={crop}
                        frameCount={editorFrameCount}
                        footprint={footprint}
                        mask={mask}
                        solid={solid}
                        seats={seatState.seats}
                        onChange={seatState.setSeats}
                        error={form.formState.errors.seats?.message}
                        disabled={disabled}
                        selected={seatState.selected}
                        onSelect={seatState.setSelected}
                        onRemoveImage={removeImage}
                        leading={getTabs()}
                        actions={actions}
                        fill
                        side={
                            <SeatsList
                                fill
                                seats={seatState.seats}
                                onChange={seatState.setSeats}
                                selected={seatState.selected}
                                onSelect={seatState.setSelected}
                                disabled={disabled}
                            />
                        }
                    />
                );
            default:
                return renderSpriteEditor();
        }
    };

    const removeImage = () => {
        form.setValue("image", []);
        clearMarks();
    };

    const renderSpriteEditor = () => (
        <SpriteEditor
            file={file}
            crop={crop}
            frameCount={editorFrameCount}
            footprint={footprint}
            mask={mask}
            solidMask={solidMask}
            onChangeSolid={setMasks}
            onToggleTile={getTileToggle()}
            solid={solid}
            fill
            disabled={disabled}
            onMarkCrop={markCrop}
            onMarkFootprint={setFootprint}
            leading={getTabs()}
            actions={actions}
            onClear={clearMarks}
            onRemoveImage={removeImage}
        />
    );

    return (
        <div className="flex h-full min-h-0 flex-col gap-4">
            {renderEditor()}
            <InlineError
                message={
                    form.formState.errors.cropW?.message ??
                    form.formState.errors.footprintW?.message
                }
            />
        </div>
    );
};
