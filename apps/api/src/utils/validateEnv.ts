import { MissingEnvError } from "@/errors/MissingEnvError";

export const validateEnv = (names: string[]): void => {
    const missing = names.filter((name) => !process.env[name]);

    if (missing.length > 0) {
        throw new MissingEnvError(missing);
    }
};
