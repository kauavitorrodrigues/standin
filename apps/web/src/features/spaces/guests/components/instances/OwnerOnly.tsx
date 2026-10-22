import type { ReactNode } from "react";
import { usePermission } from "@/features/auth/hooks/usePermission";

// Only the owner of the organization makes the links and turns guest access on
// or off. The hosts, members included, answer the requests and send guests
// out, so the rest of the dialog is theirs too.
export const OwnerOnly = ({ children }: { children: ReactNode }) => {
    const isOwner = usePermission("update", "space");

    if (!isOwner) return null;

    return children;
};
