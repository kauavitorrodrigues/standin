import type { ClassifiedPublishError } from "@/features/editor/types/publish-error";

// What the publish mutation rejects with, so callers switch on `failure.kind`.
export class PublishError extends Error {
    readonly failure: ClassifiedPublishError;

    constructor(failure: ClassifiedPublishError) {
        super(failure.kind);
        this.name = "PublishError";
        this.failure = failure;
    }
}
