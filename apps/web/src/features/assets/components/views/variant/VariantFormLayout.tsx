import type { ReactNode } from "react";

type Props = {
    // The editor of a new rotation goes beside the fields.
    wide: boolean;
    children: ReactNode;
};

// The grid of the form of a variation. When the editor is shown it marks
// itself with `data-wide`, and the dialog opens up to hold it beside the
// fields.
export const VariantFormLayout = ({ wide, children }: Props) => {
    if (wide) {
        return (
            <div
                data-wide
                className="grid gap-4 md:grid-cols-[32rem_minmax(0,1fr)] md:gap-6"
            >
                {children}
            </div>
        );
    }
    return <div className="grid gap-4">{children}</div>;
};
