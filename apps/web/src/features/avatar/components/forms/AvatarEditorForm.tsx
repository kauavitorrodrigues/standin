import { useEffect } from "react";
import type { RefObject } from "react";
import { FormProvider } from "react-hook-form";
import { useAvatarEditorForm } from "../../hooks/useAvatarEditorForm";
import type { AvatarEditor, MyAvatar } from "../../types/editor";
import { CategoryListField } from "../fields/CategoryListField";
import { PartGridField } from "../fields/PartGridField";
import { AvatarPreviewPanel } from "../instances/AvatarPreviewPanel";
import { AvatarEditorLayout } from "../layout/AvatarEditorLayout";
import { FormDialogControls } from "@/components/FormDialogControls";

type AvatarEditorFormProps = {
    editor: AvatarEditor;
    isDirtyRef: RefObject<boolean>;
    onDone: () => void;
    onSaved?: (avatar: MyAvatar) => void;
};

// The editor itself: categories, parts and preview over one draft.
export const AvatarEditorForm = ({
    editor,
    isDirtyRef,
    onDone,
    onSaved,
}: AvatarEditorFormProps) => {
    const { form, isSubmitting, isDirty, submit } = useAvatarEditorForm({
        editor,
        onDone,
        onSaved,
    });

    useEffect(() => {
        isDirtyRef.current = isDirty;
    }, [isDirty, isDirtyRef]);

    return (
        <FormProvider {...form}>
            <form onSubmit={submit} className="flex flex-col gap-4">
                <AvatarEditorLayout.Body>
                    <AvatarEditorLayout.Slots>
                        <CategoryListField categories={editor.categories} />
                    </AvatarEditorLayout.Slots>
                    <AvatarEditorLayout.Center>
                        <PartGridField />
                    </AvatarEditorLayout.Center>
                    <AvatarEditorLayout.Preview>
                        <AvatarPreviewPanel editor={editor} />
                    </AvatarEditorLayout.Preview>
                </AvatarEditorLayout.Body>
                <FormDialogControls
                    submitLabel="Concluir"
                    isSubmitting={isSubmitting}
                    submitDisabled={!isDirty}
                />
            </form>
        </FormProvider>
    );
};
