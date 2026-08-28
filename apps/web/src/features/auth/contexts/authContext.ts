import { createContext } from "react";
import type { User } from "@standin/contracts";

export type AuthContextValue = {
    user: User | null;
    isLoading: boolean;
};

export const AuthContext = createContext<AuthContextValue | null>(null);
