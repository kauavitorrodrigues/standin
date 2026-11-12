import { BaseError } from "@standin/contracts";

export class BrowserLoadTestUsageError extends BaseError {
    constructor(detail: string) {
        super(detail, "BROWSER_LOAD_TEST_USAGE", 400);
    }
}

export class BrowserLoadTestNoStatsError extends BaseError {
    constructor(clientIndex: number) {
        super(
            `Client ${clientIndex} has no WebRTC connection, so there is nothing to measure.`,
            "BROWSER_LOAD_TEST_NO_STATS",
            500
        );
    }
}

export class BrowserLoadTestControlError extends BaseError {
    constructor(clientIndex: number, label: string) {
        super(
            `Client ${clientIndex} could not switch "${label}" on.`,
            "BROWSER_LOAD_TEST_CONTROL",
            500
        );
    }
}
