import { SERVICE_TOKEN_SCOPES } from "@standin/contracts";
import { describe, expect, it } from "vitest";
import { SERVICE_TOKEN_PENDING_SCOPES } from "../../consts/scopes";
import { getScopeColumns, getScopeGroups } from "../getScopeGroups";
import { getScopeMeta } from "../getScopeMeta";

describe("getScopeMeta", () => {
    it("names the scope by its resource and action", () => {
        expect(getScopeMeta("maps:read").label).toBe("Mapas (leitura)");
        expect(getScopeMeta("maps:write").label).toBe("Mapas (escrita)");
        expect(getScopeMeta("library:read").label).toBe("Biblioteca (leitura)");
    });

    it("gives each scope a description and an icon", () => {
        for (const scope of SERVICE_TOKEN_SCOPES) {
            const meta = getScopeMeta(scope);
            expect(meta.description).not.toBe("");
            expect(meta.icon).toBeDefined();
        }
    });

    it("tells which scopes no route accepts yet, and only those", () => {
        for (const scope of SERVICE_TOKEN_SCOPES) {
            const pending = SERVICE_TOKEN_PENDING_SCOPES.includes(scope);
            expect(getScopeMeta(scope).description.includes("(em breve)")).toBe(
                pending
            );
        }
    });

    it("only lists pending scopes that exist", () => {
        for (const scope of SERVICE_TOKEN_PENDING_SCOPES) {
            expect(SERVICE_TOKEN_SCOPES).toContain(scope);
        }
    });
});

describe("getScopeGroups and getScopeColumns", () => {
    it("draws one row per resource with its scopes", () => {
        const groups = getScopeGroups();
        expect(groups.map((group) => group.label)).toEqual([
            "Biblioteca",
            "Mapas",
            "Modelos de mapa",
        ]);
        expect(groups[1].scopes).toEqual(["maps:read", "maps:write"]);
        for (const group of groups) {
            expect(group.description).not.toBe("");
            expect(group.icon).toBeDefined();
        }
    });

    it("puts every scope in exactly one row", () => {
        const scopes = getScopeGroups().flatMap((group) => group.scopes);
        expect([...scopes].sort()).toEqual([...SERVICE_TOKEN_SCOPES].sort());
    });

    it("draws one column per action", () => {
        expect(getScopeColumns()).toEqual([
            { action: "read", label: "Leitura" },
            { action: "write", label: "Escrita" },
        ]);
    });
});
