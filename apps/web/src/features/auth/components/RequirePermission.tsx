import type { PropsWithChildren, ReactNode } from "react";
import type { Action, Resource } from "@standin/auth";
import { usePermission } from "../hooks/usePermission";

type RequirePermissionProps = PropsWithChildren<{
    action: Action;
    resource: Resource;
    fallback?: ReactNode;
}>;

export const RequirePermission = ({
    action,
    resource,
    fallback = null,
    children,
}: RequirePermissionProps) => {
    const allowed = usePermission(action, resource);

    if (!allowed) return fallback;

    return <>{children}</>;
};
