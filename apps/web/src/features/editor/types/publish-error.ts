import type { PublishIssue } from "@standin/contracts";
import type { PUBLISH_ERROR_KIND } from "@/features/editor/consts/publish";

export type PublishErrorKind =
    (typeof PUBLISH_ERROR_KIND)[keyof typeof PUBLISH_ERROR_KIND];

export type ClassifiedPublishError =
    | {
          kind: typeof PUBLISH_ERROR_KIND.VALIDATION;
          issues: PublishIssue[];
      }
    | { kind: typeof PUBLISH_ERROR_KIND.STALE }
    | { kind: typeof PUBLISH_ERROR_KIND.LOCK_LOST }
    | { kind: typeof PUBLISH_ERROR_KIND.RETRYABLE }
    | { kind: typeof PUBLISH_ERROR_KIND.UNKNOWN };
