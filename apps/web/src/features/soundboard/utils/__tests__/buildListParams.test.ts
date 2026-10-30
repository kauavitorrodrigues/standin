import { describe, expect, it } from "vitest";
import { SOUNDBOARD_CLIP_SCOPES } from "@standin/contracts";
import { buildListParams } from "../buildListParams";

const DEFAULT = SOUNDBOARD_CLIP_SCOPES.DEFAULT;

describe("buildListParams", () => {
    it("asks an organization for one scope", () => {
        expect(
            buildListParams("organization", { scope: DEFAULT, search: "" }, 2)
                .scope
        ).toBe(DEFAULT);
    });

    it("asks the admin's route for no scope, since it only has the default clips", () => {
        expect(
            buildListParams("admin", { scope: DEFAULT, search: "" }, 1).scope
        ).toBeUndefined();
    });

    it("leaves an empty search out and passes the page", () => {
        const params = buildListParams(
            "organization",
            { scope: DEFAULT, search: "" },
            3
        );

        expect(params.search).toBeUndefined();
        expect(params.page).toBe(3);
    });

    it("sends the search", () => {
        expect(
            buildListParams("admin", { scope: DEFAULT, search: "buzina" }, 1)
                .search
        ).toBe("buzina");
    });
});
