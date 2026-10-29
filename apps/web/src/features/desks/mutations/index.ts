import { useAssign } from "./assign";
import { useClaim } from "./claim";
import { useRelease } from "./release";

export const DeskMutations = {
    assign: useAssign,
    claim: useClaim,
    release: useRelease,
};
