import type {
    LibraryFamilyDetail,
    LibraryFamilyVariant,
} from "@standin/contracts";
import { useDeleteAssetDialog } from "@/features/assets/hooks/useDeleteAssetDialog";
import { AssetSubject } from "@/features/assets/components/views/asset/AssetSubject";
import { FamilyDeletionNote } from "@/features/assets/components/views/asset/FamilyDeletionNote";
import { ConfirmDeleteDialog } from "./ConfirmDeleteDialog";

type Props = {
    asset: LibraryFamilyVariant;
    family: Pick<LibraryFamilyDetail, "variants">;
    open: boolean;
    onOpenChange: (open: boolean) => void;
};

// Deleting an asset for good.
export const DeleteDialog = ({ asset, family, open, onOpenChange }: Props) => {
    const { isFamily, pending, confirm } = useDeleteAssetDialog({
        asset,
        family,
        onOpenChange,
    });

    return (
        <ConfirmDeleteDialog
            open={open}
            onOpenChange={onOpenChange}
            title={
                <>
                    Apagar <AssetSubject isFamily={isFamily} />
                </>
            }
            description={
                <>
                    Este item será apagado de vez. Essa ação não pode ser
                    desfeita.
                    <FamilyDeletionNote isFamily={isFamily} />
                </>
            }
            confirmLabel="Apagar"
            pending={pending}
            onConfirm={confirm}
        />
    );
};
