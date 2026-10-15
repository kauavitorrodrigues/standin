import { hasPermission, type Action, type Resource } from "@standin/auth";
import { useRoles } from "./useRoles";

export const usePermission = (action: Action, resource: Resource): boolean =>
    hasPermission(useRoles(), action, resource);
