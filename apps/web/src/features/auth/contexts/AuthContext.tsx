import type { ReactNode } from "react";
import type { User } from "@standin/contracts";
import { AuthContext } from "./authContext";

type AuthProviderProps = { user: User; children: ReactNode };

export function AuthProvider({ user, children }: AuthProviderProps) {
    return (
        <AuthContext.Provider value={{ user }}>{children}</AuthContext.Provider>
    );
}
