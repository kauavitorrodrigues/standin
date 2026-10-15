import { describe, expect, it } from "vitest";
import {
    LOCK_HEARTBEAT_MS,
    LOCK_TTL_MS,
    MAX_CELLS_PER_OP,
    MAX_PUBLISH_OPS,
} from "../limits";

describe("editor limits", () => {
    it("keeps the lock alive for more than one heartbeat", () => {
        expect(LOCK_TTL_MS).toBeGreaterThan(LOCK_HEARTBEAT_MS);
    });

    it("lets a few heartbeats be missed before the lock expires", () => {
        expect(LOCK_TTL_MS).toBeGreaterThanOrEqual(LOCK_HEARTBEAT_MS * 2);
    });

    it("keeps one operation smaller than a whole publish", () => {
        expect(MAX_CELLS_PER_OP).toBeLessThan(MAX_PUBLISH_OPS * 10);
        expect(MAX_CELLS_PER_OP).toBeLessThanOrEqual(MAX_PUBLISH_OPS);
    });
});
