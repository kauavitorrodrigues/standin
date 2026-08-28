import type { ReactNode } from "react";
import { useQuery } from "@tanstack/react-query";
import { getMeQueryOptions } from "../queries/getMe";
import { AuthContext } from "./authContext";

export function AuthProvider({ children }: { children: ReactNode }) {
    const { data, isLoading } = useQuery(getMeQueryOptions());

    return (
        <AuthContext.Provider value={{ user: data ?? null, isLoading }}>
            {children}
        </AuthContext.Provider>
    );
}
