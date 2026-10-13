import type { LibraryFamilyDetail } from "@standin/contracts";
import { VariantInfo } from "@/features/assets/components/fields/variant/VariantInfo";
import { TeleportTargetFields } from "@/features/assets/components/fields/variant/TeleportTargetFields";
import { IdentityFields } from "@/features/assets/components/fields/variant/IdentityFields";
import { ImageField } from "@/features/assets/components/fields/variant/ImageField";
import { EditorSection } from "@/features/assets/components/instances/variant/editor/EditorSection";
import { SeatsSection } from "@/features/assets/components/instances/variant/editor/SeatsSection";
import { FormIssues } from "@/features/assets/components/views/form/FormIssues";
import { VariantFormFooter } from "@/features/assets/components/views/variant/VariantFormFooter";
import { VariantFormLayout } from "@/features/assets/components/views/variant/VariantFormLayout";
import { useAddVariantForm } from "@/features/assets/hooks/useAddVariantForm";

type Props = {
    family: LibraryFamilyDetail;
    onDone: () => void;
};

// A new color on a rotation of the family, or a new rotation. Each variation
// is its own PNG. A color copies everything else from the sibling of its
// rotation, a new rotation also needs its own footprint and actions.
export const AddVariantForm = ({ family, onDone }: Props) => {
    const state = useAddVariantForm({ family, onDone });
    const { form, base, isSubmitting } = state;

    return (
        <form onSubmit={state.submit} className="flex flex-col gap-4">
            <FormIssues message={state.issuesMessage} />
            <VariantFormLayout wide={state.showEditor}>
                <div className="flex min-w-0 flex-col gap-4">
                    <ImageField
                        control={form.control}
                        hasFile={state.file !== undefined}
                        disabled={isSubmitting}
                    />
                    <IdentityFields
                        control={form.control}
                        familyHasColor={state.familyHasColor}
                        disabled={isSubmitting}
                    />
                    <TeleportTargetFields
                        control={form.control}
                        action={base.action}
                        isNewRotation={state.isNewRotation}
                        disabled={isSubmitting}
                    />
                    <VariantInfo
                        form={form}
                        action={base.action}
                        frameCount={state.frameCount}
                        disabled={isSubmitting}
                        familyHasColor={state.familyHasColor}
                        isNewRotation={state.isNewRotation}
                    />
                    <SeatsSection
                        show={state.showEditor && state.hasSeats}
                        form={form}
                        selected={state.selectedSeat}
                        onSelect={state.setSelectedSeat}
                        disabled={isSubmitting}
                    />
                </div>
                <EditorSection
                    show={state.showEditor}
                    form={form}
                    file={state.file}
                    frameCount={state.frameCount}
                    solid={base.solid}
                    disabled={isSubmitting}
                    hasSeats={state.hasSeats}
                    selectedSeat={state.selectedSeat}
                    onSelectSeat={state.setSelectedSeat}
                />
            </VariantFormLayout>
            <VariantFormFooter isSubmitting={isSubmitting} onCancel={onDone} />
        </form>
    );
};
