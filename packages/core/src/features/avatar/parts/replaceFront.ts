import type { AvatarUpload } from "../types";
import { swapPartSheet } from "../utils/swapPartSheet";
import type { SwapPartSheetResult } from "../utils/swapPartSheet";

/** Swaps the sprite PNG of a part and refreshes the avatars that use it. */
export const replaceFront = (
    partId: string,
    image: AvatarUpload | undefined
): Promise<SwapPartSheetResult> => swapPartSheet(partId, image);
