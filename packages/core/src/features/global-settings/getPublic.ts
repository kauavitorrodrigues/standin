import type { PublicGlobalSettings } from "@standin/contracts";
import { getGlobalSettings } from "./get";

/** What may be read before signing in. */
export const getPublicGlobalSettings =
    async (): Promise<PublicGlobalSettings> => {
        const { allowSignup } = await getGlobalSettings();
        return { allowSignup };
    };
