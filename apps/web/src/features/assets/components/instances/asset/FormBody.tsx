import type { UseFormReturn } from "react-hook-form";
import { AssetInfo } from "@/features/assets/components/fields/asset/AssetInfo";
import { FormFields } from "@/features/assets/components/fields/asset/FormFields";
import { ImageFields } from "@/features/assets/components/fields/asset/ImageFields";
import { AssetUploadStep } from "@/features/assets/components/views/upload/AssetUploadStep";
import { FormFooter } from "@/features/assets/components/views/form/FormFooter";
import type { CreateAssetFormValues } from "@/features/assets/types/createForm";

type Props = {
    form: UseFormReturn<CreateAssetFormValues>;
    file: File | undefined;
    isSubmitting: boolean;
    onFileChosen: (file: File) => void;
    onCancel: () => void;
};

// What the form of a new asset shows. The first step is only the image, and
// the rest of the form comes in once there is one.
export const FormBody = ({
    form,
    file,
    isSubmitting,
    onFileChosen,
    onCancel,
}: Props) => {
    if (!file) {
        return (
            <AssetUploadStep
                control={form.control}
                disabled={isSubmitting}
                onFileChosen={onFileChosen}
            />
        );
    }

    return (
        <>
            <div className="grid gap-8 lg:grid-cols-2">
                <div className="flex flex-col gap-4">
                    <FormFields form={form} disabled={isSubmitting} />
                    <AssetInfo form={form} />
                </div>
                <ImageFields form={form} file={file} disabled={isSubmitting} />
            </div>
            <FormFooter
                submitLabel="Criar asset"
                isSubmitting={isSubmitting}
                onCancel={onCancel}
            />
        </>
    );
};
