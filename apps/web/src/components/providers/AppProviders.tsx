import type { ReactNode } from "react";
import { QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { queryClient } from "@/lib/tanstack/queryClient";
import { ThemeProvider } from "./ThemeProvider";
import { Toaster } from "@/components/ui/toast";
import { TooltipProvider } from "@/components/ui/tooltip";

export default function AppProviders({ children }: { children: ReactNode }) {
    return (
        <QueryClientProvider client={queryClient}>
            <ThemeProvider defaultTheme="system">
                <TooltipProvider>
                    <Toaster>{children}</Toaster>
                </TooltipProvider>
            </ThemeProvider>
            {/*<ReactQueryDevtools buttonPosition="bottom-right" />*/}
        </QueryClientProvider>
    );
}
