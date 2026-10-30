import type { LibrarySeed } from "@standin/core";
import { MESSAGES } from "../../consts/messages";
import type {
    CommandOutput,
    SeedDryRunResult,
    SeedKeyLists,
} from "../../types";
import { listSeedKeys } from "../../utils/listSeedKeys";
import { SEED_GROUPS } from "./consts";

export const buildSeedDryRunOutput = (seed: LibrarySeed): CommandOutput => {
    const keys: SeedKeyLists = listSeedKeys(seed);
    const result: SeedDryRunResult = {
        dryRun: true,
        databaseChecked: false,
        keys,
    };
    const lines: string[] = SEED_GROUPS.flatMap(({ group, label }) =>
        keys[group].map((key) => MESSAGES.seedValid(label, key))
    );
    lines.push(MESSAGES.dryRunNoDatabase);
    return { result, lines };
};
