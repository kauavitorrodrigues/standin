export type OrganizationMembersChange = {
    organizationId: string;
};

export type OrganizationMembersChangedListener = (
    change: OrganizationMembersChange
) => void | Promise<void>;

const listeners = new Set<OrganizationMembersChangedListener>();

/**
 * Registers a function that runs when the people or the invitations of an
 * organization change, so the sockets can tell its owners as it happens.
 * Returns a function that removes the listener.
 */
export const onOrganizationMembersChanged = (
    listener: OrganizationMembersChangedListener
): (() => void) => {
    listeners.add(listener);
    return () => {
        listeners.delete(listener);
    };
};

/**
 * Whatever adds a person or changes an invitation calls this once it is saved.
 * It never fails the caller: the change is already made, and a listener that
 * throws is logged and does not stop the others.
 */
export const publishOrganizationMembersChanged = async (
    change: OrganizationMembersChange
): Promise<void> => {
    for (const listener of listeners) {
        try {
            await listener(change);
        } catch (error) {
            console.error(error);
        }
    }
};
