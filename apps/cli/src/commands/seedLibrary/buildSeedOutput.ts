import type { LibrarySeedResult } from "@standin/core";
import { MESSAGES } from "../../consts/messages";
import type { CommandOutput } from "../../types";
import { SEED_GROUPS } from "./consts";

export const buildSeedOutput = (result: LibrarySeedResult): CommandOutput => {
    const lines: string[] = SEED_GROUPS.flatMap(({ group, label }) =>
        result[group].map(({ key, action }) =>
            MESSAGES.seedAction(label, key, action)
        )
    );
    return { result, lines };
};
