import bcrypt from "bcryptjs";
import type { BootstrapData } from "@standin/contracts";
import { assignRandomAvatar } from "../../../avatar/user/assignRandomAvatar";
import { BCRYPT_SALT_ROUNDS } from "../../../users/consts";
import { BootstrapRepository } from "../../repository";
import type { ResolvedAdmin } from "../../types";
import { generatePassword } from "./generatePassword";

// The admin of the instance: the existing one, or a new one created together
// with the organization when there is none yet.
export const resolveAdmin = async (
    input: BootstrapData,
    existingAdmin: { id: string; email: string } | null,
    hasOrganization: boolean
): Promise<ResolvedAdmin> => {
    if (existingAdmin) {
        return {
            admin: existingAdmin,
            organization: null,
            step: {
                target: "admin",
                status: "exists",
                label: `admin already exists: ${existingAdmin.email}`,
            },
        };
    }

    const password = input.password ?? generatePassword();

    // An existing organization is left alone: only the admin is created.
    const created = await BootstrapRepository.createAdmin({
        name: input.name,
        email: input.email,
        passwordHash: await bcrypt.hash(password, BCRYPT_SALT_ROUNDS),
        organizationName: hasOrganization ? undefined : input.organizationName,
    });
    // Like the sign up, it never fails the install.
    await assignRandomAvatar(created.admin.id);

    return {
        admin: created.admin,
        organization: created.organization,
        generatedPassword: input.password ? undefined : password,
        step: {
            target: "admin",
            status: "created",
            label: `admin created: ${created.admin.email}`,
        },
    };
};
