import { createElement } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderToStaticMarkup } from "react-dom/server";
import type { ServiceToken } from "@standin/contracts";
import { describe, expect, it, vi } from "vitest";
import { ServiceTokensContent } from "../ServiceTokensContent";

// The revoke dialog imports the API client, which needs the env to load.
vi.mock("@/lib/axios/api", () => ({ api: {} }));

const NOW = new Date("2026-10-30T12:00:00.000Z");

const buildToken = (overrides: Partial<ServiceToken>): ServiceToken => ({
    id: "t1",
    name: "importer",
    tokenPrefix: "sit_ab12",
    scopes: ["library:write", "maps:write"],
    createdById: "u1",
    lastUsedAt: null,
    expiresAt: null,
    revokedAt: null,
    createdAt: new Date("2026-10-01T00:00:00.000Z"),
    updatedAt: new Date("2026-10-01T00:00:00.000Z"),
    ...overrides,
});

type Params = {
    serviceTokens?: ServiceToken[];
    isLoading?: boolean;
    isError?: boolean;
};

const render = ({
    serviceTokens = [],
    isLoading = false,
    isError = false,
}: Params) =>
    renderToStaticMarkup(
        createElement(
            QueryClientProvider,
            { client: new QueryClient() },
            createElement(ServiceTokensContent, {
                serviceTokens,
                isLoading,
                isError,
                onRetry: () => undefined,
                now: NOW,
            })
        )
    );

describe("ServiceTokensContent", () => {
    it("shows the skeleton while loading", () => {
        const html = render({ isLoading: true });
        expect(html).toContain("Carregando os tokens");
        expect(html).toContain('data-slot="skeleton"');
    });

    it("shows the error with a retry button", () => {
        const html = render({ isError: true });
        expect(html).toContain("Erro ao buscar os tokens");
        expect(html).toContain("Tentar de novo");
    });

    it("shows the empty state without tokens", () => {
        const html = render({});
        expect(html).toContain("Nenhum token ainda");
        expect(html).toContain("Novo token");
    });

    it("lists the tokens with prefix, scopes and dates", () => {
        const html = render({ serviceTokens: [buildToken({})] });
        expect(html).toContain("importer");
        expect(html).toContain("sit_ab12");
        expect(html).toContain("Biblioteca");
        expect(html).toContain("Mapas");
        expect(html).toContain("sit_ab12");
        expect(html).toContain("<table");
        expect(html).toContain("Nunca usado");
        expect(html).toContain("Não expira");
        expect(html).toContain('data-status="active"');
    });

    // The actions sit in a menu that is closed on the first render, so what a
    // status allows is checked in getTokenActions. Here: one menu per row.
    it("gives every token one actions menu and no loose action buttons", () => {
        const past = new Date("2026-10-01T00:00:00.000Z");
        const tokens = [
            buildToken({}),
            buildToken({ id: "t2", name: "old", expiresAt: past }),
            buildToken({ id: "t3", name: "gone", revokedAt: past }),
        ];
        const html = render({ serviceTokens: tokens });

        for (const name of ["importer", "old", "gone"]) {
            expect(html).toContain(`Ações ${name}`);
        }
        expect(html).toContain('data-status="expired"');
        expect(html).toContain('data-status="revoked"');
        expect(html).not.toContain("Gerar novo token");
        expect(html).not.toContain("Revogar");
    });
});
