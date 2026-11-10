import type { ReactNode } from "react";

type Props = {
    children: ReactNode;
};

// The bottom of an app dialog: it stays in place while the body scrolls.
export const AppDialogFooter = ({ children }: Props) => (
    <div className="flex items-center justify-end gap-2 border-t p-4">
        {children}
    </div>
);
