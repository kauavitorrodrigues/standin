import {
    SCREEN_HD_OFF_TIER,
    type ScreenResolutionTier,
} from "@/features/media-devices/consts/streamingSettings";

/**
 * The tier a share really starts at. HIGH falls back to MED when the
 * performance level says HD is off, every other tier is kept.
 */
export const resolveScreenTier = (
    tier: ScreenResolutionTier,
    hdAllowed: boolean
): ScreenResolutionTier => {
    if (hdAllowed) return tier;

    switch (tier) {
        case "HIGH":
            return SCREEN_HD_OFF_TIER;
        default:
            return tier;
    }
};
