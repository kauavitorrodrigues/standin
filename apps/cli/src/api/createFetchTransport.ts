import { API_TIMEOUT_MS, LOCATION_HEADER } from "../consts/api";
import type { FetchFunction, HttpResponse, HttpTransport } from "../types";
import { parseResponseBody } from "../utils/parseResponseBody";

// The transport of a real run: the fetch of Node, no dependency. A redirect
// is handed back as it is (manual), so the token never follows it to another
// place. It throws when the server cannot be reached or does not answer in
// time; the client turns that into its own error. Fetch and timeout can be
// replaced, so a test needs no network.
export const createFetchTransport =
    (
        fetchImpl: FetchFunction = fetch,
        timeoutMs: number = API_TIMEOUT_MS
    ): HttpTransport =>
    async (request) => {
        const response: Response = await fetchImpl(request.url, {
            method: request.method,
            headers: request.headers,
            body: request.body,
            redirect: "manual",
            signal: AbortSignal.timeout(timeoutMs),
        });
        const result: HttpResponse = {
            status: response.status,
            body: parseResponseBody(await response.text()),
            location: response.headers.get(LOCATION_HEADER) ?? undefined,
        };
        return result;
    };
