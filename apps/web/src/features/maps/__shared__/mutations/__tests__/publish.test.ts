import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { AxiosError } from "axios";
import {
    PUBLISH_ERROR_KIND,
    PUBLISH_SESSION_HEADER,
} from "@/features/editor/consts/publish";
import { PublishError } from "@/features/maps/__shared__/utils/PublishError";
import { publishMap } from "@/features/maps/__shared__/mutations/publish";

const post = vi.hoisted(() => vi.fn());

vi.mock("@/lib/axios/api", () => ({ api: { post } }));

const input = {
    mapId: "map-1",
    sessionId: "session-1",
    publishId: "0b8f4c1e-5f0a-4f6e-9a55-2f5d3a1f7a10",
    baseVersion: 3,
    ops: [],
};
const result = {
    version: 4,
    idMap: {},
    desks: [],
    limits: { objectsUsed: 1, objectsMax: 9 },
};

const httpError = (status: number, data: unknown = {}) =>
    new AxiosError("fail", "ERR", undefined, undefined, {
        status,
        data,
    } as never);

const networkError = () => new AxiosError("Network Error");

const failureOf = async (promise: Promise<unknown>) => {
    const error = await promise.then(
        () => null,
        (e: unknown) => e
    );
    expect(error).toBeInstanceOf(PublishError);
    return (error as PublishError).failure;
};

describe("publishMap", () => {
    beforeEach(() => {
        post.mockReset();
        vi.useFakeTimers();
    });
    afterEach(() => vi.useRealTimers());

    it("returns the result and sends body and session header", async () => {
        post.mockResolvedValue({ data: result });
        await expect(publishMap(input)).resolves.toEqual(result);
        expect(post).toHaveBeenCalledWith(
            "/maps/map-1/publish",
            { publishId: input.publishId, baseVersion: 3, ops: [] },
            { headers: { [PUBLISH_SESSION_HEADER]: "session-1" } }
        );
    });

    it("turns 422 into validation with the issues, without retrying", async () => {
        const issues = [{ opIndex: 0, code: "X", path: "a", message: "m" }];
        post.mockRejectedValue(httpError(422, { errors: issues }));
        const failure = await failureOf(publishMap(input));
        expect(failure).toEqual({
            kind: PUBLISH_ERROR_KIND.VALIDATION,
            issues,
        });
        expect(post).toHaveBeenCalledTimes(1);
    });

    it("turns 409 into stale without retrying", async () => {
        post.mockRejectedValue(httpError(409));
        expect(await failureOf(publishMap(input))).toEqual({
            kind: PUBLISH_ERROR_KIND.STALE,
        });
        expect(post).toHaveBeenCalledTimes(1);
    });

    it("turns 423 into lockLost without retrying", async () => {
        post.mockRejectedValue(httpError(423));
        expect(await failureOf(publishMap(input))).toEqual({
            kind: PUBLISH_ERROR_KIND.LOCK_LOST,
        });
        expect(post).toHaveBeenCalledTimes(1);
    });

    it("retries a 500 and then succeeds", async () => {
        post.mockRejectedValueOnce(httpError(500)).mockResolvedValue({
            data: result,
        });
        const promise = publishMap(input);
        await vi.runAllTimersAsync();
        await expect(promise).resolves.toEqual(result);
        expect(post).toHaveBeenCalledTimes(2);
    });

    it("gives up as retryable after three failures", async () => {
        post.mockRejectedValue(httpError(500));
        const promise = failureOf(publishMap(input));
        await vi.runAllTimersAsync();
        expect(await promise).toEqual({ kind: PUBLISH_ERROR_KIND.RETRYABLE });
        expect(post).toHaveBeenCalledTimes(3);
    });

    it("retries network errors", async () => {
        post.mockRejectedValueOnce(networkError()).mockResolvedValue({
            data: result,
        });
        const promise = publishMap(input);
        await vi.runAllTimersAsync();
        await expect(promise).resolves.toEqual(result);
    });

    it("keeps the same publishId in every attempt", async () => {
        post.mockRejectedValue(httpError(503));
        const promise = failureOf(publishMap(input));
        await vi.runAllTimersAsync();
        await promise;
        const ids = post.mock.calls.map((call) => call[1].publishId);
        expect(ids).toEqual([
            input.publishId,
            input.publishId,
            input.publishId,
        ]);
    });
});
