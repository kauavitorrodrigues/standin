import type { AvatarCategory } from "@standin/contracts";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { EditCategoryForm } from "../../forms/admin/EditCategoryForm";

type Props = {
    category: AvatarCategory;
    open: boolean;
    onOpenChange: (open: boolean) => void;
};

export const EditCategoryDialog = ({ category, open, onOpenChange }: Props) => (
    <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent>
            <DialogHeader>
                <DialogTitle>Editar categoria</DialogTitle>
                <DialogDescription>
                    As categorias são fixas. Aqui muda o nome e o lugar delas na
                    lista do editor de avatar.
                </DialogDescription>
            </DialogHeader>
            <EditCategoryForm
                category={category}
                onDone={() => onOpenChange(false)}
            />
        </DialogContent>
    </Dialog>
);
