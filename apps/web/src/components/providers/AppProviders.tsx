import type { ReactNode } from "react";
import { QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { queryClient } from "@/lib/tanstack/queryClient";
import { AuthProvider } from "@/features/auth/contexts/AuthContext";

export default function AppProviders({ children }: { children: ReactNode }) {
    return (
        <QueryClientProvider client={queryClient}>
            <AuthProvider>{children}</AuthProvider>
            <ReactQueryDevtools buttonPosition="bottom-right" />
        </QueryClientProvider>
    );
}
