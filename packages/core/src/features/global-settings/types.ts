import type { GlobalSettings } from "@standin/contracts";

export type GlobalSettingsEnv = Record<string, string | undefined>;

export type SettingsReader = () => Promise<GlobalSettings>;
