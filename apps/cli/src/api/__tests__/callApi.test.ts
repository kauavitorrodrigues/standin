import { describe, expect, it } from "vitest";
import { UnexpectedFailure } from "../../testing/UnexpectedFailure";
import { EXIT_CODES } from "../../consts/exitCodes";
import { ApiAuthError } from "../../errors/ApiAuthError";
import { ApiConflictError } from "../../errors/ApiConflictError";
import { ApiRedirectError } from "../../errors/ApiRedirectError";
import { ApiResponseInvalidError } from "../../errors/ApiResponseInvalidError";
import { ApiNetworkError } from "../../errors/ApiNetworkError";
import { ApiRequestFailedError } from "../../errors/ApiRequestFailedError";
import { ApiValidationError } from "../../errors/ApiValidationError";
import { resolveExitCode } from "../../errors/resolveExitCode";
import { toErrorReport } from "../../errors/toErrorReport";
import { createFakeHttp } from "../../testing/createFakeHttp";
import type { ApiCall, FakeHttpAnswer, RemoteTarget } from "../../types";
import { callApi } from "../callApi";

const TARGET: RemoteTarget = {
    url: "https://standin.test/base",
    token: "sit_secret",
};
const CALL: ApiCall = { method: "GET", path: "/maps/m1/render" };

const call = (answer: FakeHttpAnswer, api = CALL) => {
    const fake = createFakeHttp({
        [`${api.method} /base${api.path}`]: answer,
    });
    return { fake, promise: callApi(fake.transport, TARGET, api) };
};

describe("callApi", () => {
    it("gives back the body of a success", async () => {
        const { promise } = call({ status: 200, body: { ok: 1 } });

        await expect(promise).resolves.toEqual({ ok: 1 });
    });

    it("keeps the base path and sends the token as a bearer", async () => {
        const { fake, promise } = call({ status: 200, body: {} });
        await promise;

        expect(fake.requests[0]).toMatchObject({
            method: "GET",
            url: "https://standin.test/base/maps/m1/render",
            headers: { authorization: "Bearer sit_secret" },
        });
        expect(fake.requests[0].body).toBeUndefined();
    });

    it("sends a JSON body with its content type", async () => {
        const post: ApiCall = { method: "POST", path: "/x", body: { a: 1 } };
        const { fake, promise } = call({ status: 200, body: {} }, post);
        await promise;

        expect(fake.requests[0].body).toBe('{"a":1}');
        expect(fake.requests[0].headers["content-type"]).toBe(
            "application/json"
        );
    });

    it("adds the query to the URL", async () => {
        const fake = createFakeHttp({
            "GET /base/library/assets?page=2&pageSize=100": {
                status: 200,
                body: { ok: 1 },
            },
        });

        await expect(
            callApi(fake.transport, TARGET, {
                method: "GET",
                path: "/library/assets",
                query: { page: 2, pageSize: 100 },
            })
        ).resolves.toEqual({ ok: 1 });
    });

    it.each([
        [401, ApiAuthError, EXIT_CODES.AUTH],
        [403, ApiAuthError, EXIT_CODES.AUTH],
        [409, ApiConflictError, EXIT_CODES.CONFLICT],
        [423, ApiConflictError, EXIT_CODES.CONFLICT],
        [400, ApiValidationError, EXIT_CODES.VALIDATION],
        [422, ApiValidationError, EXIT_CODES.VALIDATION],
        [404, ApiRequestFailedError, EXIT_CODES.VALIDATION],
        [413, ApiRequestFailedError, EXIT_CODES.VALIDATION],
        [500, ApiRequestFailedError, EXIT_CODES.INTERNAL],
        [500, ApiRequestFailedError, EXIT_CODES.INTERNAL],
        [502, ApiRequestFailedError, EXIT_CODES.NETWORK],
        [503, ApiRequestFailedError, EXIT_CODES.NETWORK],
        [504, ApiRequestFailedError, EXIT_CODES.NETWORK],
    ])(
        "maps the status %i to its error and exit code",
        async (status, ErrorClass, exit) => {
            const { promise } = call({
                status,
                body: { error: "no", code: "SOME" },
            });

            const error = await promise.catch((e: unknown) => e);
            expect(error).toBeInstanceOf(ErrorClass);
            expect(resolveExitCode(error)).toBe(exit);
            expect(toErrorReport(error).code).toBe("SOME");
        }
    );

    it("turns a failure of the transport into the network error with its code", async () => {
        const failure = Object.assign(new TypeError("fetch failed"), {
            cause: { code: "ECONNREFUSED" },
        });
        const { promise } = call(failure);

        const error = await promise.catch((e: unknown) => e);
        expect(error).toBeInstanceOf(ApiNetworkError);
        expect(resolveExitCode(error)).toBe(EXIT_CODES.NETWORK);
        expect(toErrorReport(error).message).toContain("ECONNREFUSED");
    });

    it("names a timeout", async () => {
        const failure = Object.assign(new UnexpectedFailure("aborted"), {
            name: "TimeoutError",
        });
        const { promise } = call(failure);

        await expect(promise).rejects.toMatchObject({
            message: expect.stringContaining("TIMEOUT"),
        });
    });

    it("survives an error body that is not an object", async () => {
        const { promise } = call({ status: 502, body: undefined });

        const error = await promise.catch((e: unknown) => e);
        expect(toErrorReport(error)).toMatchObject({
            code: "CLI_API_REQUEST_FAILED",
            message: "The server answered 502.",
        });
    });

    it("never puts the token in an error", async () => {
        const answers = [
            {
                status: 401,
                body: { error: "bad", code: "SERVICE_TOKEN_REVOKED" },
            },
            { status: 403, body: { error: "no" } },
            { status: 409, body: { error: "stale", version: 3 } },
            { status: 422, body: { error: "bad", errors: [{ message: "x" }] } },
        ];
        for (const answer of answers) {
            const { promise } = call(answer);
            const error = await promise.catch((e: unknown) => e);
            expect(JSON.stringify(toErrorReport(error))).not.toContain(
                "sit_secret"
            );
        }
    });

    describe("the error of a conflict", () => {
        it("carries the version of a stale layout", async () => {
            const { promise } = call({
                status: 409,
                body: {
                    error: "stale",
                    code: "STALE_LAYOUT_VERSION",
                    version: 9,
                },
            });

            const report = toErrorReport(
                await promise.catch((e: unknown) => e)
            );
            expect(report.details).toEqual({ version: 9 });
            expect(report.fix).toContain("--base-version");
        });

        it("carries who holds the lock", async () => {
            const by = { id: "u1", name: "Ana" };
            const { promise } = call({
                status: 423,
                body: { error: "locked", code: "MAP_LOCKED", by, since: "now" },
            });

            const report = toErrorReport(
                await promise.catch((e: unknown) => e)
            );
            expect(report.details).toEqual({ by, since: "now" });
        });
    });

    it.each([
        ["no body", undefined],
        ["an HTML page", "<!doctype html><html></html>"],
        ["null", null],
        ["a number", 7],
    ])("refuses a 200 with %s: the URL is not the API", async (_name, body) => {
        const { promise } = call({ status: 200, body });

        const error = await promise.catch((e: unknown) => e);
        expect(error).toBeInstanceOf(ApiResponseInvalidError);
        expect(resolveExitCode(error)).toBe(EXIT_CODES.NETWORK);
        expect(toErrorReport(error).fix).toContain("not at the web app");
    });

    describe("a redirect", () => {
        it("is not followed and shows the destination without its query", async () => {
            const { promise } = call({
                status: 301,
                body: undefined,
                location:
                    "https://api.standin.test/maps/m1/render?token=leak#x",
            });

            const error = await promise.catch((e: unknown) => e);
            expect(error).toBeInstanceOf(ApiRedirectError);
            expect(resolveExitCode(error)).toBe(EXIT_CODES.NETWORK);
            const report = toErrorReport(error);
            expect(report.fix).toContain(
                "https://api.standin.test/maps/m1/render"
            );
            expect(JSON.stringify(report)).not.toContain("leak");
        });

        it("resolves a relative location and copes with none", async () => {
            const relative = await call({
                status: 302,
                body: undefined,
                location: "/login",
            }).promise.catch((e: unknown) => e);
            expect(toErrorReport(relative).fix).toContain(
                "https://standin.test/login"
            );

            const none = await call({
                status: 307,
                body: undefined,
            }).promise.catch((e: unknown) => e);
            expect(toErrorReport(none).fix).toContain("final URL");
        });
    });

    describe("the fix of an answer with no class of its own", () => {
        it("says the id or the URL is wrong on a 404 with no code", async () => {
            const { promise } = call({
                status: 404,
                body: { error: "Not found." },
            });

            const report = toErrorReport(
                await promise.catch((e: unknown) => e)
            );
            expect(report.fix).toContain("map id or the URL is wrong");
        });

        it("keeps a 404 that the server explained as it is", async () => {
            const { promise } = call({
                status: 404,
                body: { error: "Map not found.", code: "MAP_NOT_FOUND" },
            });

            expect(
                toErrorReport(await promise.catch((e: unknown) => e)).fix
            ).toBeUndefined();
        });

        it.each([502, 503, 504])(
            "tells to check the instance on a %i",
            async (status) => {
                const { promise } = call({ status, body: undefined });

                expect(
                    toErrorReport(await promise.catch((e: unknown) => e)).fix
                ).toContain("instance is running");
            }
        );
    });

    it("does not put a path or a URL in the network error", async () => {
        const { promise } = call(new UnexpectedFailure("x", "ECONNREFUSED"));

        const report = toErrorReport(await promise.catch((e: unknown) => e));
        expect(report.path).toBeUndefined();
        expect(report.fix).toContain("STANDIN_URL");
    });
});
