// The flag wins over the variable. Blank counts as not set, as in the scripts
// of the api.
export const pickOption = (
    flag: string | undefined,
    fromEnv: string | undefined
): string | undefined => flag?.trim() || fromEnv?.trim() || undefined;
