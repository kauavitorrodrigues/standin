import { IntegrationService, OrganizationMemberService } from "@standin/core";

/**
 * A person who stops being a member (removed or left) keeps no connection to
 * an outside service in that organization: the tokens are deleted. Returns a function
 * that removes the listener.
 */
export const registerIntegrationsCleanup = (): (() => void) =>
    OrganizationMemberService.onRemoved(({ userId, organizationId }) =>
        IntegrationService.disconnectMember({ organizationId, userId })
    );
