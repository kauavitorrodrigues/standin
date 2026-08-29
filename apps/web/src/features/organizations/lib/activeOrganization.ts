const ACTIVE_ORGANIZATION_KEY = "active_organization_id";

export const getActiveOrganizationId = (): string | null => {
    return localStorage.getItem(ACTIVE_ORGANIZATION_KEY);
};

export const setActiveOrganizationId = (id: string): void => {
    return localStorage.setItem(ACTIVE_ORGANIZATION_KEY, id);
};

export const clearActiveOrganizationId = (): void => {
    return localStorage.removeItem(ACTIVE_ORGANIZATION_KEY);
};
