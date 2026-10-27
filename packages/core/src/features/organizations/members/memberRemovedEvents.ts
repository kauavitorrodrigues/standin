export type OrganizationMemberRemoval = {
    userId: string;
    organizationId: string;
};

export type OrganizationMemberRemovedListener = (
    removal: OrganizationMemberRemoval
) => void | Promise<void>;

const listeners = new Set<OrganizationMemberRemovedListener>();

/**
 * Registers a function that runs every time a person stops being an active
 * member of an organization (removed, or left), so the sockets can cut the
 * access they were holding. Returns a function that removes the listener.
 */
export const onOrganizationMemberRemoved = (
    listener: OrganizationMemberRemovedListener
): (() => void) => {
    listeners.add(listener);
    return () => {
        listeners.delete(listener);
    };
};

/**
 * Whatever ends a membership calls this once it is saved. A listener that
 * throws is logged and does not stop the others.
 */
export const publishOrganizationMemberRemoved = async (
    removal: OrganizationMemberRemoval
): Promise<void> => {
    for (const listener of listeners) {
        try {
            await listener(removal);
        } catch (error) {
            console.error(error);
        }
    }
};
