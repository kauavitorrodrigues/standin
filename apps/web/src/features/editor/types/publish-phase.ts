import type { PUBLISH_PHASE } from "@/features/editor/consts/publish-phase";

export type PublishPhase = (typeof PUBLISH_PHASE)[keyof typeof PUBLISH_PHASE];
