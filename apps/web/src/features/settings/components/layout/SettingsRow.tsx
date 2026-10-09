import type { ReactNode } from "react";

type Props = {
    title: string;
    description?: string;
    // The control on the right: a select, a switch, a button.
    children?: ReactNode;
};

export const SettingsRow = ({ title, description, children }: Props) => (
    <div className="flex items-center justify-between gap-6">
        <div className="flex min-w-0 flex-col gap-1">
            <span className="text-[15px] font-semibold">{title}</span>
            {description && (
                <span className="text-[13px] text-muted-foreground">
                    {description}
                </span>
            )}
        </div>
        {children && <div className="shrink-0">{children}</div>}
    </div>
);
