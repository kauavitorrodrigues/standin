import { describe, expect, it } from "vitest";
import { getTableConfig } from "drizzle-orm/pg-core";
import { spacesTable } from "../schema/spaces";
import { filesTable } from "../schema/files";

const config = getTableConfig(spacesTable);

describe("spaces thumbnail column", () => {
    const column = config.columns.find(
        ({ name }) => name === "thumbnail_file_id"
    );

    it("exists and is nullable, since spaces made before it have none", () => {
        expect(column).toBeDefined();
        expect(column?.notNull).toBe(false);
    });

    it("has no default, a space starts without a photo", () => {
        expect(column?.hasDefault).toBe(false);
    });

    it("references the files table", () => {
        const foreignKey = config.foreignKeys.find((fk) =>
            fk.reference().columns.some(({ name }) => name === "thumbnail_file_id")
        );

        expect(foreignKey?.reference().foreignTable).toBe(filesTable);
    });

    it("is indexed", () => {
        const names = config.indexes.map(({ config }) => config.name);

        expect(names).toContain("spaces_thumbnail_file_id_index");
    });
});
