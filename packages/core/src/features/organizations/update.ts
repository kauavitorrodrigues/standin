import { organizationSelect } from "./consts/select";
import { db, organizationsTable, eq } from "@standin/database";
import type {
    Organization,
    OrganizationUpdateSchemaType,
} from "@standin/contracts";

export const updateOrganization = async (
    id: string,
    data: OrganizationUpdateSchemaType
): Promise<Organization> => {
    const [organization] = await db
        .update(organizationsTable)
        .set(data)
        .where(eq(organizationsTable.id, id))
        .returning(organizationSelect);
    return organization;
};
