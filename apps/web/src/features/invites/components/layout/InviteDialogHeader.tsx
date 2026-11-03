import { DialogTitle } from "@/components/ui/dialog";

// The bar on top of the dialog.
export const InviteDialogHeader = ({ title }: { title: string }) => (
    <div className="flex items-center border-b px-4 py-3">
        <DialogTitle className="text-base font-semibold">{title}</DialogTitle>
    </div>
);
