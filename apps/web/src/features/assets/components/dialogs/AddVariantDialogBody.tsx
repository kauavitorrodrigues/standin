import type { LibraryFamilySummary } from "@standin/contracts";
import { AddVariantForm } from "@/features/assets/components/forms/AddVariantForm";
import { useLibraryFamily } from "@/features/assets/queries/useLibraryFamily";

type Props = {
    family: LibraryFamilySummary;
    onDone: () => void;
};

// The form of a new variation, once the whole family is there to build it on.
export const AddVariantDialogBody = ({ family, onDone }: Props) => {
    const { data: detail, isLoading } = useLibraryFamily(family.familyId);

    if (isLoading) {
        return <p className="text-muted-foreground text-sm">Carregando...</p>;
    }
    if (!detail) return null;

    return <AddVariantForm family={detail} onDone={onDone} />;
};
