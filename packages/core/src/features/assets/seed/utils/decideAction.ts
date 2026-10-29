import { SEED_ACTIONS } from "../types";
import type { SeedAction } from "../types";

/** The action of an entry that already exists. */
export const decideAction = (changed: boolean): SeedAction =>
    changed ? SEED_ACTIONS.UPDATE : SEED_ACTIONS.UNCHANGED;
