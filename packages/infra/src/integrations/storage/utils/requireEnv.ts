import { MissingEnvironmentVariableError } from "@standin/contracts";

export const requireEnv = (name: string): string => {
    const value = process.env[name]?.trim();
    if (!value) throw new MissingEnvironmentVariableError(name);
    return value;
};
