import type { RequestHandler } from "express";
import type { AuthProviders } from "@standin/contracts";
import { GithubProvider } from "@standin/infra";

export const providers: RequestHandler = (_req, res) => {
    const body: AuthProviders = { github: GithubProvider.isConfigured() };

    res.status(200).json(body);
};
