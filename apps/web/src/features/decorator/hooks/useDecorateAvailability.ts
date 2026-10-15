import type { MapLockState } from "@standin/contracts";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { useMapRender } from "@/features/game/queries/useMapRender";
import { getDecorateAvailability } from "@/features/decorator/utils/getDecorateAvailability";

// Whether the Decorar entries show and work. The permission comes from the
// render payload of the map, and the lock is the one the page follows live.
export const useDecorateAvailability = (mapId: string, lock: MapLockState) => {
    const { user } = useAuth();
    const { data } = useMapRender(mapId);

    return getDecorateAvailability({
        canDecorate: data?.access.canDecorate ?? false,
        lock,
        userId: user.id,
    });
};
