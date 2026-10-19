import type { AvatarSlot } from "@standin/contracts";
import {
    AVATAR_API_PATHS,
    AVATAR_CATEGORY_PARTS_SUBPATH,
} from "../consts/editor/paths";

// `GET /avatar/categories/:slot/parts`.
export const buildCategoryPartsPath = (slot: AvatarSlot): string =>
    `${AVATAR_API_PATHS.CATEGORIES}/${slot}/${AVATAR_CATEGORY_PARTS_SUBPATH}`;
