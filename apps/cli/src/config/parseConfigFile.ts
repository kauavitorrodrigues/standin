import { ConfigFileInvalidError } from "../errors/ConfigFileInvalidError";
import type { CliConfigFile } from "../types";
import { isOptionalText } from "./isOptionalText";
import { parseJsonText } from "./parseJsonText";

// The content of the login file. Anything that is not an object with a text
// url and token is refused, without echoing it: it holds a token.
export const parseConfigFile = (
    text: string,
    configPath: string
): CliConfigFile => {
    const value: unknown = parseJsonText(text);
    if (typeof value !== "object" || value === null || Array.isArray(value)) {
        throw new ConfigFileInvalidError(configPath);
    }
    const file: CliConfigFile = value as CliConfigFile;
    if (!isOptionalText(file.url) || !isOptionalText(file.token)) {
        throw new ConfigFileInvalidError(configPath);
    }
    return { url: file.url, token: file.token };
};
