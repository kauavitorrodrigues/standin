import bcrypt from "bcryptjs";
import {
    BootstrapInputInvalidError,
    BootstrapInputSchema,
} from "@standin/contracts";
import type { BootstrapInput } from "@standin/contracts";
import { assignRandomAvatar } from "../../avatar/user/assignRandomAvatar";
import { OrganizationService } from "../../organizations";
import { BCRYPT_SALT_ROUNDS } from "../../users/consts";
import { BootstrapRepository } from "../repository";
import type { BootstrapInstanceResult, BootstrapStep } from "../types";
import { generatePassword } from "./utils/generatePassword";

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
    const { email, name, organizationName } = parsed.data;

    const steps: BootstrapStep[] = [];
    let generatedPassword: string | undefined;

    const existingAdmin = await BootstrapRepository.findActiveAdmin();
    const existingOrganization =
        await BootstrapRepository.findFirstOrganization();

    let admin: { id: string; email: string };
    let organization = existingOrganization;
    let organizationCreated = false;

    if (existingAdmin) {
        admin = existingAdmin;
        steps.push({
            target: "admin",
            status: "exists",
            label: `admin already exists: ${admin.email}`,
        });
    } else {
        const password = parsed.data.password ?? generatePassword();
        if (!parsed.data.password) generatedPassword = password;

        // An existing organization is left alone: only the admin is created.
        const created = await BootstrapRepository.createAdmin({
            name,
            email,
            passwordHash: await bcrypt.hash(password, BCRYPT_SALT_ROUNDS),
            organizationName: existingOrganization
                ? undefined
                : organizationName,
        });
        admin = created.admin;
        if (created.organization) {
            organization = created.organization;
            organizationCreated = true;
        }
        steps.push({
            target: "admin",
            status: "created",
            label: `admin created: ${admin.email}`,
        });
        // Like the sign up, it never fails the install.
        await assignRandomAvatar(admin.id);
    }

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
