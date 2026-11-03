import type { ReactNode } from "react";
import { Card } from "@/components/ui/card";

export function JoinLayout({ children }: { children: ReactNode }) {
    return (
        <div className="flex min-h-dvh w-full items-center justify-center bg-background p-6">
            <Card className="w-full max-w-sm">{children}</Card>
        </div>
    );
}
