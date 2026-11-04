import { BaseError } from "../errors/base";

export class UnknownOnboardingTaskError extends BaseError {
    constructor() {
        super(
            "This onboarding task does not exist.",
            "UNKNOWN_ONBOARDING_TASK",
            400
        );
    }
}
