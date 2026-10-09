import { hasPermission, type Action, type Resource } from "@standin/auth";
import { useRole } from "./useRole";

export const usePermission = (action: Action, resource: Resource): boolean =>
    hasPermission(useRole(), action, resource);
