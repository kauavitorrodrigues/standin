import slugify from "slugify";
import { db, organizationsTable, eq, and, isNull } from "@standin/database";

export const generateUniqueOrganizationSlug = async (
    name: string
): Promise<string> => {
    const baseSlug =
        slugify(name, { lower: true, strict: true }) || "organizacao";

    let slug = baseSlug;
    let attempt = 0;

    while (true) {
        const [existing] = await db
            .select({ id: organizationsTable.id })
            .from(organizationsTable)
            .where(
                and(
                    eq(organizationsTable.slug, slug),
                    isNull(organizationsTable.deletedAt)
                )
            );

        if (!existing) return slug;

        attempt += 1;
        slug = `${baseSlug}-${Math.random().toString(36).slice(2, 6)}${attempt > 5 ? attempt : ""}`;
    }
};
