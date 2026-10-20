import { AVATAR_BASE_KINDS } from "@standin/contracts";
import type { AvatarBaseKind } from "@standin/contracts";
import { TextFormField } from "@/components/fields/TextFormField";
import { FormFooter } from "@/features/assets/components/views/form/FormFooter";
import { FormIssues } from "@/features/assets/components/views/form/FormIssues";
import { useNewBaseForm } from "../../../hooks/admin/useNewBaseForm";
import { BaseDefaultField } from "../../fields/admin/BaseDefaultField";
import { BaseSheetField } from "../../fields/admin/BaseSheetField";
import { PreviewFileField } from "../../fields/admin/PreviewFileField";
import { CreatePartLayout } from "../../layout/admin/CreatePartLayout";
import { BaseSheetPreview } from "../../views/admin/BaseSheetPreview";

type Props = { kind: AvatarBaseKind };

type FooterProps = {
    kind: AvatarBaseKind;
    isSubmitting: boolean;
    canSubmit: boolean;
    onCancel: () => void;
};

const NewBaseFooter = ({
    kind,
    isSubmitting,
    canSubmit,
    onCancel,
}: FooterProps) => {
    switch (kind) {
        case AVATAR_BASE_KINDS.BODY:
            return (
                <FormFooter
                    submitLabel="Criar avatar base"
                    isSubmitting={isSubmitting}
                    canSubmit={canSubmit}
                    onCancel={onCancel}
                />
            );
        case AVATAR_BASE_KINDS.MANNEQUIN:
            return (
                <FormFooter
                    submitLabel="Criar manequim"
                    isSubmitting={isSubmitting}
                    canSubmit={canSubmit}
                    onCancel={onCancel}
                />
            );
    }
};

// A new blank avatar or a new mannequin: its name, the sprite sheet, the
// optional image of the lists and whether it takes the place in use. The
// preview shows the sprite as soon as it is chosen.
export const NewBaseForm = ({ kind }: Props) => {
    const {
        form,
        layers,
        sheetIssue,
        isSheetLoading,
        isFirstOfKind,
        isSubmitting,
        issuesMessage,
        submit,
        goBack,
    } = useNewBaseForm({ kind });

    return (
        <CreatePartLayout
            form={
                <form onSubmit={submit} className="flex flex-col gap-5">
                    <FormIssues message={issuesMessage} />
                    <TextFormField
                        control={form.control}
                        name="name"
                        label="Nome"
                        required
                        disabled={isSubmitting}
                    />
                    <BaseSheetField
                        control={form.control}
                        kind={kind}
                        disabled={isSubmitting}
                    />
                    <PreviewFileField
                        control={form.control}
                        name="preview"
                        id="new-base-preview"
                        label="Imagem da lista (opcional)"
                        disabled={isSubmitting}
                        hideDropzoneWhenFilled
                    />
                    <BaseDefaultField
                        control={form.control}
                        kind={kind}
                        disabled={isSubmitting}
                        isFirstOfKind={isFirstOfKind}
                    />
                    <NewBaseFooter
                        kind={kind}
                        isSubmitting={isSubmitting}
                        canSubmit={!isSheetLoading}
                        onCancel={goBack}
                    />
                </form>
            }
            preview={
                <BaseSheetPreview
                    layers={layers}
                    issue={sheetIssue}
                    isLoading={isSheetLoading}
                />
            }
        />
    );
};
