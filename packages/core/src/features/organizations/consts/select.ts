import { organizationsTable } from "@standin/database";

export const organizationSelect = {
    id: organizationsTable.id,
    name: organizationsTable.name,
    slug: organizationsTable.slug,
    ownerId: organizationsTable.ownerId,
};
