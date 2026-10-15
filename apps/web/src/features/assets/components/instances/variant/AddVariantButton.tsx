import { useState } from "react";
import type { LibraryFamilySummary } from "@standin/contracts";
import { Button } from "@/components/ui/button";
import { AddVariantDialog } from "@/features/assets/components/dialogs/AddVariantDialog";

export const AddVariantButton = ({
    family,
}: {
    family: LibraryFamilySummary;
}) => {
    const [open, setOpen] = useState(false);

    return (
        <>
            <Button variant="outline" size="sm" onClick={() => setOpen(true)}>
                Nova variação
            </Button>
            <AddVariantDialog
                family={family}
                open={open}
                onOpenChange={setOpen}
            />
        </>
    );
};
