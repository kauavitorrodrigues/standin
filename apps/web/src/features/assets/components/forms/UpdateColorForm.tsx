import type { LibraryFamilyVariant } from "@standin/contracts";
import { ColorFields } from "@/features/assets/components/fields/ColorFields";
import { FormFooter } from "@/features/assets/components/views/form/FormFooter";
import { FormIssues } from "@/features/assets/components/views/form/FormIssues";
import { useUpdateColorForm } from "@/features/assets/hooks/useUpdateColorForm";

type Props = {
    asset: LibraryFamilyVariant;
    onDone: () => void;
};

// Renames and recolors the color of a row. The API applies it to every
// rotation of that color, so the family stays consistent.
export const UpdateColorForm = ({ asset, onDone }: Props) => {
    const state = useUpdateColorForm({ asset, onDone });

    return (
        <form onSubmit={state.submit} className="flex flex-col gap-4">
            <FormIssues message={state.issuesMessage} />
            <ColorFields
                control={state.form.control}
                disabled={state.isSubmitting}
                required
                hint="A chave identifica a cor (vermelho, azul) e vale para todas as rotações dela."
            />
            <FormFooter
                submitLabel="Salvar"
                isSubmitting={state.isSubmitting}
                onCancel={onDone}
            />
        </form>
    );
};
