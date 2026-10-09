import { useOrganization } from "@/features/organizations/hooks/useOrganization";

// Empty string while no organization is selected, for the callers that need
// a plain string key instead of an optional one.
export const useOrganizationId = () =>
    useOrganization().organization?.id ?? "";
