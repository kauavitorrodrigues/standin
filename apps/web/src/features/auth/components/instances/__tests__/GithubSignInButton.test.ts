import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { describe, expect, it, vi } from "vitest";

vi.mock("@/lib/api/url", () => ({ API_BASE_URL: "http://localhost:3001" }));
vi.mock("@/lib/axios/api", () => ({ api: { get: vi.fn() } }));

import { authProvidersQueryOptions } from "../../../queries/getAuthProviders";
import { GithubSignInButton } from "../GithubSignInButton";

const render = (providers: { github: boolean } | undefined) => {
    const client = new QueryClient();
    if (providers) {
        client.setQueryData(authProvidersQueryOptions().queryKey, providers);
    }

    return renderToStaticMarkup(
        createElement(
            QueryClientProvider,
            { client },
            createElement(GithubSignInButton)
        )
    );
};

describe("GithubSignInButton", () => {
    it("is a link to the API start route when GitHub is on", () => {
        const html = render({ github: true });

        expect(html).toContain('href="http://localhost:3001/auth/github"');
        expect(html).toContain("Entrar com GitHub");
        expect(html).not.toContain("<button");
    });

    it("renders nothing when GitHub is off", () => {
        expect(render({ github: false })).toBe("");
    });

    it("renders nothing while the providers are not known", () => {
        expect(render(undefined)).toBe("");
    });
});
