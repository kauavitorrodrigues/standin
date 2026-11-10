import type { ReactNode } from "react";

type Props = {
    title: string;
    children: ReactNode;
};

// A titled block of the dialog of an app.
export const AppSection = ({ title, children }: Props) => (
    <section className="flex flex-col gap-2">
        <h3 className="text-[15px] font-semibold">{title}</h3>
        {children}
    </section>
);
