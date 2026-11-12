import { useSyncExternalStore } from "react";
import { teleportWhenBlockedPreference } from "@/features/game/lib/teleportWhenBlockedPreference";

export const useTeleportWhenBlockedPreference = () =>
    useSyncExternalStore(
        teleportWhenBlockedPreference.subscribe,
        teleportWhenBlockedPreference.get
    );
