import { Switch } from "@/components/ui/switch";
import { useTeleportWhenBlockedPreference } from "@/features/game/hooks/useTeleportWhenBlockedPreference";
import { teleportWhenBlockedPreference } from "@/features/game/lib/teleportWhenBlockedPreference";
import { MOVEMENT_MESSAGES } from "../../consts/movementMessages";

export const TeleportWhenBlockedSwitch = () => {
    const isOn = useTeleportWhenBlockedPreference();

    return (
        <Switch
            aria-label={MOVEMENT_MESSAGES.teleportAriaLabel}
            checked={isOn}
            onCheckedChange={(checked) =>
                teleportWhenBlockedPreference.set(checked)
            }
        />
    );
};
