import type { LibraryFamilyVariant } from "@standin/contracts";
import { NumberFormField } from "@/components/fields/NumberFormField";
import { SelectFormField } from "@/components/fields/SelectFormField";
import { SwitchFormField } from "@/components/fields/SwitchFormField";
import { TextareaFormField } from "@/components/fields/TextareaFormField";
import { TextFormField } from "@/components/fields/TextFormField";
import { EditAnimationFields } from "@/features/assets/components/fields/asset/EditAnimationFields";
import { AssetInUseNotice } from "@/features/assets/components/views/asset/AssetInUseNotice";
import { FormFooter } from "@/features/assets/components/views/form/FormFooter";
import { FormIssues } from "@/features/assets/components/views/form/FormIssues";
import {
    CATEGORY_OPTIONS,
    PLACEMENT_OPTIONS,
} from "@/features/assets/consts/createForm";
import { useEditAssetForm } from "@/features/assets/hooks/useEditAssetForm";

type Props = {
    asset: LibraryFamilyVariant;
    onDone: () => void;
};

// Edits the base asset. What comes from the PNG (frame size, frame count and
// so the footprint) is not here, it changes with the image. A row used by a
// map only accepts name, prompt and category.
export const EditForm = ({ asset, onDone }: Props) => {
    const { form, isSubmitting, isDisabled, issuesMessage, submit } =
        useEditAssetForm({ asset, onDone });

    return (
        <form onSubmit={submit} className="flex flex-col gap-4">
            <FormIssues message={issuesMessage} />
            <AssetInUseNotice show={asset.inUse} />
            <TextFormField
                control={form.control}
                name="name"
                label="Nome"
                required
                disabled={isDisabled("name")}
            />
            <TextareaFormField
                control={form.control}
                name="promptText"
                label="Texto de interação"
                rows={2}
                disabled={isDisabled("promptText")}
            />
            <div className="flex items-start gap-2">
                <SelectFormField
                    control={form.control}
                    name="category"
                    label="Categoria"
                    className="w-full flex-1"
                    options={CATEGORY_OPTIONS}
                    disabled={isDisabled("category")}
                />
                <SelectFormField
                    control={form.control}
                    name="placement"
                    label="Posicionamento"
                    className="w-full flex-1"
                    options={PLACEMENT_OPTIONS}
                    disabled={isDisabled("placement")}
                />
            </div>
            <div className="flex items-end gap-2">
                <NumberFormField
                    control={form.control}
                    name="surfaceHeightPx"
                    label="Altura da superfície (px)"
                    className="w-full flex-1"
                    disabled={isDisabled("surfaceHeightPx")}
                />
                <SwitchFormField
                    control={form.control}
                    name="solid"
                    label="Bloqueia a passagem"
                    className="w-full flex-1"
                    disabled={isDisabled("solid")}
                />
            </div>
            <EditAnimationFields
                control={form.control}
                show={asset.animation !== null}
                disabled={isDisabled("frameDurationMs")}
            />
            <FormFooter
                submitLabel="Salvar"
                isSubmitting={isSubmitting}
                onCancel={onDone}
            />
        </form>
    );
};
