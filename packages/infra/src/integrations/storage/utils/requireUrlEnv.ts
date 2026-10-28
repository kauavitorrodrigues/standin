import { InvalidEnvironmentVariableError } from "@standin/contracts";
import { requireEnv } from "./requireEnv";

type UrlRules = {
    // The S3 endpoint is the service root. A path there is almost always the
    // bucket name pasted from a dashboard, which would end up in every key.
    rootOnly?: boolean;
};

export const requireUrlEnv = (name: string, rules: UrlRules = {}): string => {
    const value = requireEnv(name);

    let url: URL;
    try {
        url = new URL(value);
    } catch {
        throw new InvalidEnvironmentVariableError(name, "must be a valid URL");
    }

    if (url.protocol !== "http:" && url.protocol !== "https:") {
        throw new InvalidEnvironmentVariableError(
            name,
            "must start with http:// or https://"
        );
    }

    if (rules.rootOnly && url.pathname !== "/") {
        throw new InvalidEnvironmentVariableError(
            name,
            "must not include a path (leave the bucket name out)"
        );
    }

    return value;
};
