import {
    DEFAULT_TELEPORT_WHEN_BLOCKED,
    TELEPORT_WHEN_BLOCKED_STORAGE_KEY,
} from "@/features/game/consts/teleport-preference";
import { createLocalPreference } from "@/lib/createLocalPreference";

export const teleportWhenBlockedPreference = createLocalPreference({
    key: TELEPORT_WHEN_BLOCKED_STORAGE_KEY,
    fallback: DEFAULT_TELEPORT_WHEN_BLOCKED,
    parse: (stored) =>
        typeof stored === "boolean" ? stored : DEFAULT_TELEPORT_WHEN_BLOCKED,
});
