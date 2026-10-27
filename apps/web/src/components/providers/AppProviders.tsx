import type { ReactNode } from "react";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "@/lib/tanstack/queryClient";
import { ThemeProvider } from "./ThemeProvider";
import { useApplyReduceMotion } from "@/features/settings/performance/hooks/useApplyReduceMotion";
import { useApplyDegradation } from "@/features/settings/performance/hooks/useApplyDegradation";
import { DegradationBanner } from "@/features/settings/components/instances/DegradationBanner";
import { Toaster } from "@/components/ui/toast";
import { TooltipProvider } from "@/components/ui/tooltip";

export default function AppProviders({ children }: { children: ReactNode }) {
    useApplyReduceMotion();
    useApplyDegradation();

    return (
        <QueryClientProvider client={queryClient}>
            <ThemeProvider defaultTheme="system">
                <TooltipProvider>
                    <Toaster>{children}</Toaster>
                    <DegradationBanner />
                </TooltipProvider>
            </ThemeProvider>
            {/*<ReactQueryDevtools buttonPosition="bottom-right" />*/}
        </QueryClientProvider>
    );
}
