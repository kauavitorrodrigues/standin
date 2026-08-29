import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { Sidebar } from "@/components/ui/sidebar";

type Props = { children?: ReactNode; className?: string };

export const Root = ({ children, className }: Props) => {
    return (
        <div
            style={
                {
                    "--sidebar-width": "25rem",
                    "--sidebar": "var(--background)",
                } as React.CSSProperties
            }
        >
            <Sidebar position="contained" collapsible="offcanvas" side="right">
                <div
                    className={cn(
                        "flex h-full w-full flex-col gap-4 overflow-auto p-4",
                        className
                    )}
                >
                    {children}
                </div>
            </Sidebar>
        </div>
    );
};