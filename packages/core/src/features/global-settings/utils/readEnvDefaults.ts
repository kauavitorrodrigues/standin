import {
    DEFAULT_GLOBAL_SETTINGS,
    GLOBAL_SETTING_ENV_KEYS,
    GLOBAL_SETTING_KEYS,
} from "@standin/contracts";
import type { GlobalSettings } from "@standin/contracts";
import type { GlobalSettingsEnv } from "../types";

const FALSE_WORDS = new Set(["false", "0", "no", "off"]);
const TRUE_WORDS = new Set(["true", "1", "yes", "on"]);

// An unset or unknown value keeps the default (open), so a typo never closes
// the instance by surprise.
const parseSwitch = (raw: string | undefined, fallback: boolean): boolean => {
    const word = raw?.trim().toLowerCase();
    if (word && FALSE_WORDS.has(word)) return false;
    if (word && TRUE_WORDS.has(word)) return true;
    return fallback;
};

/** The initial values of a fresh instance, from the environment. */
export const readEnvDefaults = (
    env: GlobalSettingsEnv = process.env
): GlobalSettings => {
    const settings = { ...DEFAULT_GLOBAL_SETTINGS } as GlobalSettings;
    for (const key of GLOBAL_SETTING_KEYS) {
        settings[key] = parseSwitch(
            env[GLOBAL_SETTING_ENV_KEYS[key]],
            DEFAULT_GLOBAL_SETTINGS[key]
        );
    }
    return settings;
};
