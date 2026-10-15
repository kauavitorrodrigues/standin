import { useClaim } from "./claim";
import { useRelease } from "./release";

export const DeskMutations = {
    claim: useClaim,
    release: useRelease,
};
