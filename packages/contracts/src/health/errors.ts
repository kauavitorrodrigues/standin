import { BaseError } from "../errors/base";

// A probe that did not answer within the time limit.
export class HealthCheckTimeoutError extends BaseError {
    constructor() {
        super("The health check timed out.", "HEALTH_CHECK_TIMEOUT", 504);
    }
}
