import {
    appConnectionsTable,
    organizationIntegrationsTable,
    and,
    eq,
} from "@standin/database";
import type {
    AppConnectionKey,
    ConnectionTarget,
    OrganizationIntegrationKey,
} from "../types";

/** The app of an organization for a provider. */
export const integrationIs = ({
    organizationId,
    provider,
}: OrganizationIntegrationKey) =>
    and(
        eq(organizationIntegrationsTable.organizationId, organizationId),
        eq(organizationIntegrationsTable.provider, provider)
    );

/** Every connection made for a provider and service in an organization. */
export const connectionTargetIs = ({
    organizationId,
    provider,
    service,
}: ConnectionTarget) =>
    and(
        eq(appConnectionsTable.organizationId, organizationId),
        eq(appConnectionsTable.provider, provider),
        eq(appConnectionsTable.service, service)
    );

/** The one connection of a person for that target. */
export const connectionIs = (key: AppConnectionKey) =>
    and(connectionTargetIs(key), eq(appConnectionsTable.userId, key.userId));
