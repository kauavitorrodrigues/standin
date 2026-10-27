import { describe, expect, it, vi } from "vitest";
import { createQueryCounter, isQueryCountEnabled } from "../queryCounter";

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

describe("isQueryCountEnabled", () => {
    it("is off by default", () => {
        expect(isQueryCountEnabled(undefined)).toBe(false);
        expect(isQueryCountEnabled("")).toBe(false);
        expect(isQueryCountEnabled("0")).toBe(false);
    });

    it("turns on with 1 or true", () => {
        expect(isQueryCountEnabled("1")).toBe(true);
        expect(isQueryCountEnabled("true")).toBe(true);
    });

    it("stays off in production even with the flag", () => {
        expect(isQueryCountEnabled("1", "production")).toBe(false);
        expect(isQueryCountEnabled("true", "production")).toBe(false);
        expect(isQueryCountEnabled("1", "development")).toBe(true);
    });
});

describe("createQueryCounter", () => {
    it("counts the queries of a scope without mixing concurrent scopes", async () => {
        const log = vi.fn();
        const counter = createQueryCounter({ log, intervalMs: 100000 });
        const query = async (times: number) => {
            for (let i = 0; i < times; i++) {
                await sleep(1);
                counter.logger.logQuery("select 1", []);
            }
        };

        await Promise.all([
            counter.countScope("join a", () => query(3)),
            counter.countScope("join b", () => query(5)),
        ]);

        expect(log).toHaveBeenCalledWith("[db-query-count] join a: 3 queries");
        expect(log).toHaveBeenCalledWith("[db-query-count] join b: 5 queries");
        expect(counter.total()).toBe(8);
        counter.stop();
    });

    it("logs the queries per second only when there was traffic", async () => {
        const log = vi.fn();
        const counter = createQueryCounter({ log, intervalMs: 20 });
        await sleep(50);
        expect(log).not.toHaveBeenCalled();

        counter.logger.logQuery("select 1", []);
        counter.logger.logQuery("select 2", []);
        await sleep(50);
        expect(log).toHaveBeenCalledWith(
            "[db-query-count] 2 queries/s, total 2"
        );
        counter.stop();
    });
});
