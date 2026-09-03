import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { Sidebar } from "@/components/ui/sidebar";

type Props = { children?: ReactNode; className?: string };

export const Root = ({ children, className }: Props) => {
    return (
        <div
            className="pointer-events-none absolute inset-y-0 right-0 z-20 w-(--sidebar-width)"
            style={
                {
                    "--sidebar": "var(--background)",
                } as React.CSSProperties
            }
        >
            <Sidebar
                position="contained"
                collapsible="offcanvas"
                side="right"
                className="pointer-events-auto"
            >
                <div
                    className={cn(
                        "flex h-full min-h-0 w-full flex-col gap-4 p-4",
                        className
                    )}
                >
                    {children}
                </div>
            </Sidebar>
        </div>
    );
};
