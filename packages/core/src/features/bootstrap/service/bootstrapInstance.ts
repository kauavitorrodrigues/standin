import {
    BootstrapInputInvalidError,
    BootstrapInputSchema,
} from "@standin/contracts";
import type { BootstrapInput } from "@standin/contracts";
import { OrganizationService } from "../../organizations";
import { BootstrapRepository } from "../repository";
import type { BootstrapInstanceResult, BootstrapStep } from "../types";
import { resolveAdmin } from "./utils/resolveAdmin";

// Creates the first admin and the first organization of a fresh instance.
// Safe to run again: with an admin in place it creates no account and never
// touches a password, and an organization is only created while there is
// none. The generated password, when there is one, is only in the result.
export const bootstrapInstance = async (
    input: BootstrapInput
): Promise<BootstrapInstanceResult> => {
    const parsed = BootstrapInputSchema.safeParse(input);
    if (!parsed.success) {
        // The rule that broke and the field, never the value.
        const [issue] = parsed.error.issues;
        throw new BootstrapInputInvalidError(
            `${String(issue.path[0] ?? "input")}: ${issue.message}`
        );
    }
    const { organizationName } = parsed.data;

    const steps: BootstrapStep[] = [];

    const existingAdmin = await BootstrapRepository.findActiveAdmin();
    const existingOrganization =
        await BootstrapRepository.findFirstOrganization();

    const resolved = await resolveAdmin(
        parsed.data,
        existingAdmin,
        !!existingOrganization
    );
    const { admin, generatedPassword } = resolved;
    steps.push(resolved.step);

    let organization = resolved.organization ?? existingOrganization;
    let organizationCreated = !!resolved.organization;

    if (!organization) {
        // An admin from an earlier run and no organization yet.
        organization = await OrganizationService.create(admin.id, {
            name: organizationName,
        });
        organizationCreated = true;
    }
    steps.push({
        target: "organization",
        status: organizationCreated ? "created" : "exists",
        label: organizationCreated
            ? `organization created: ${organization.name}`
            : `organization already exists: ${organization.name}`,
    });

    return {
        steps,
        adminId: admin.id,
        organizationId: organization.id,
        ...(generatedPassword ? { generatedPassword } : {}),
    };
};
