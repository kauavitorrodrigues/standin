import type { Transaction } from "@standin/database";
import { lockByKey } from "../../../lib/advisoryLock";

/**
 * Whatever changes the apps of an organization or the places of their people
 * (saving or removing an app, taking a place, deleting the organization) runs
 * one at a time per organization, so a connection can never be written for an
 * app that was just removed or replaced.
 */
export const lockOrganizationIntegrations = (
    tx: Transaction,
    organizationId: string
): Promise<void> =>
    lockByKey(tx, `organization-integrations:${organizationId}`);
