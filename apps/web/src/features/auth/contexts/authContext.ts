import { createContext } from "react";
import type { User } from "@standin/contracts";

export type AuthContextValue = {
    user: User;
};

export const AuthContext = createContext<AuthContextValue | null>(null);
