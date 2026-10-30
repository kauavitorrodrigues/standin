import { describe, expect, it, vi } from "vitest";
import { ApiNetworkError } from "../../errors/ApiNetworkError";
import { UnexpectedFailure } from "../../testing/UnexpectedFailure";
import type { FetchFunction, HttpRequest, RemoteTarget } from "../../types";
import { buildRequest } from "../buildRequest";
import { callApi } from "../callApi";
import { createFetchTransport } from "../createFetchTransport";

const REQUEST: HttpRequest = {
    method: "POST",
    url: "https://standin.test/maps/m1/apply",
    headers: { authorization: "Bearer t" },
    body: '{"a":1}',
};
const TARGET: RemoteTarget = { url: "https://standin.test", token: "t" };

const answering = (response: Response) =>
    vi.fn<FetchFunction>(async () => response);

describe("createFetchTransport", () => {
    it("never follows a redirect and passes the request on as it is", async () => {
        const fetchImpl = answering(new Response("{}"));
        await createFetchTransport(fetchImpl)(REQUEST);

        const [url, init] = fetchImpl.mock.calls[0];
        expect(url).toBe(REQUEST.url);
        expect(init).toMatchObject({
            method: "POST",
            headers: REQUEST.headers,
            body: REQUEST.body,
            redirect: "manual",
        });
        expect(init?.signal).toBeInstanceOf(AbortSignal);
    });

    it("hands back a redirect with its location", async () => {
        const response = new Response(null, {
            status: 302,
            headers: { location: "https://other.test/x?y=1" },
        });
        const result = await createFetchTransport(answering(response))(REQUEST);

        expect(result).toEqual({
            status: 302,
            body: undefined,
            location: "https://other.test/x?y=1",
        });
    });

    it("reads a JSON body", async () => {
        const response = new Response('{"ok":true}', { status: 200 });
        const result = await createFetchTransport(answering(response))(REQUEST);

        expect(result).toMatchObject({ status: 200, body: { ok: true } });
    });

    it("gives no body for a 200 that is not JSON", async () => {
        const response = new Response("<html></html>", { status: 200 });
        const result = await createFetchTransport(answering(response))(REQUEST);

        expect(result).toMatchObject({ status: 200, body: undefined });
    });

    it("lets a failure of fetch through, for the client to name", async () => {
        const failure = new UnexpectedFailure("fetch failed", "ECONNREFUSED");
        const fetchImpl = vi.fn<FetchFunction>(async () => {
            throw failure;
        });

        await expect(createFetchTransport(fetchImpl)(REQUEST)).rejects.toBe(
            failure
        );
    });

    it("aborts a request that takes longer than the timeout", async () => {
        const fetchImpl = vi.fn<FetchFunction>(
            (_url, init) =>
                new Promise((_resolve, reject) => {
                    init?.signal?.addEventListener("abort", () =>
                        reject(init.signal?.reason)
                    );
                })
        );
        const transport = createFetchTransport(fetchImpl, 10);

        const error = await callApi(transport, TARGET, {
            method: "GET",
            path: "/x",
        }).catch((e: unknown) => e);

        expect(error).toBeInstanceOf(ApiNetworkError);
        expect((error as ApiNetworkError).message).toContain("TIMEOUT");
    });

    it("builds the request the transport sends, token in the header only", async () => {
        const fetchImpl = answering(new Response("{}"));
        await callApi(createFetchTransport(fetchImpl), TARGET, {
            method: "GET",
            path: "/x",
        });

        const request = buildRequest(TARGET, { method: "GET", path: "/x" });
        expect(fetchImpl.mock.calls[0][0]).toBe(request.url);
        expect(fetchImpl.mock.calls[0][0]).not.toContain("t=");
    });
});
