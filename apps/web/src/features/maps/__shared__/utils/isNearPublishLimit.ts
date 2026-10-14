import { MAX_PUBLISH_OPS } from "@standin/contracts";
import { PUBLISH_WARNING_RATIO } from "@/features/maps/__shared__/consts/publish";

// True from 80% of the operations one publish accepts.
export const isNearPublishLimit = (opCount: number): boolean =>
    opCount >= MAX_PUBLISH_OPS * PUBLISH_WARNING_RATIO;
