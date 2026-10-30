import type {
    CommandContext,
    CommandOutput,
    TokenListArgs,
} from "../../../types";
import { buildTokenListOutput } from "./buildTokenListOutput";

export const runTokenList = async ({
    services,
}: CommandContext<TokenListArgs>): Promise<CommandOutput> =>
    buildTokenListOutput(await services.listServiceTokens());
