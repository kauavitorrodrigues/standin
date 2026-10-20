import { useMemo } from "react";
import { useFormContext, useWatch } from "react-hook-form";
import { useDownloadAvatar } from "../../hooks/useDownloadAvatar";
import { useDraftLayers } from "../../hooks/useDraftLayers";
import { useRandomizeDraft } from "../../hooks/useRandomizeDraft";
import type { AvatarEditorFormValues } from "../../types/draft";
import type { AvatarEditor } from "../../types/editor";
import { BasePickerField } from "../fields/BasePickerField";
import { DownloadButton } from "../views/DownloadButton";
import { PreviewImageError } from "../views/PreviewImageError";
import { RandomizeButton } from "../views/RandomizeButton";
import { AvatarPreviewCanvas } from "./AvatarPreviewCanvas";

type AvatarPreviewPanelProps = { editor: AvatarEditor };

// The preview of the draft with the two buttons on its corners: download on
// top and random avatar at the bottom. The base picker sits above it.
export const AvatarPreviewPanel = ({ editor }: AvatarPreviewPanelProps) => {
    const { control } = useFormContext<AvatarEditorFormValues>();
    const baseId = useWatch({ control, name: "baseId" });
    const parts = useWatch({ control, name: "parts" });
    const draft = useMemo(() => ({ baseId, parts }), [baseId, parts]);
    const { layers, hasError } = useDraftLayers(draft, editor.bases);
    const { randomize, isRandomizing } = useRandomizeDraft(editor.categories);
    const download = useDownloadAvatar(layers);

    return (
        <>
            <BasePickerField bases={editor.bases} />
            <div className="relative min-h-0 flex-1">
                <AvatarPreviewCanvas layers={layers} className="h-full w-full" />
                <div className="absolute top-2 right-2">
                    <DownloadButton
                        hasAvatar={layers.length > 0}
                        onDownload={download}
                    />
                </div>
                <div className="absolute right-2 bottom-2">
                    <RandomizeButton
                        isLoading={isRandomizing}
                        onRandomize={randomize}
                    />
                </div>
            </div>
            <PreviewImageError hasError={hasError} />
        </>
    );
};
