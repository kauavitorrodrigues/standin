import type { LibraryFamilyVariant } from "@standin/contracts";
import { PngFormField } from "@/components/fields/PngFormField";
import { FormFooter } from "@/features/assets/components/views/form/FormFooter";
import { FormIssues } from "@/features/assets/components/views/form/FormIssues";
import { ReplaceImageSummary } from "@/features/assets/components/views/upload/ReplaceImageSummary";
import { useReplaceImageForm } from "@/features/assets/hooks/useReplaceImageForm";

type Props = {
    asset: LibraryFamilyVariant;
    onDone: () => void;
};

// Swaps the PNG of a row that no map uses. The new one has to keep the frame
// size and, for an animated asset, the frame count.
export const ReplaceImageForm = ({ asset, onDone }: Props) => {
    const state = useReplaceImageForm({ asset, onDone });

    return (
        <form onSubmit={state.submit} className="flex flex-col gap-4">
            <FormIssues message={state.issuesMessage} />
            <PngFormField
                control={state.form.control}
                id="replace-asset-image"
                label="Novo PNG"
                hint="Precisa ter o mesmo tamanho de frame do atual e, se a peça é animada, a mesma quantidade de frames."
                placeholder="Arraste o PNG ou clique."
                disabled={state.isSubmitting}
            />
            <ReplaceImageSummary
                file={state.file}
                frameCount={state.frameCount}
            />
            <FormFooter
                submitLabel="Trocar imagem"
                isSubmitting={state.isSubmitting}
                onCancel={onDone}
            />
        </form>
    );
};
