import { vi } from "vitest";
import type { HttpRequest, HttpResponse, FakeHttpRoutes } from "../types";

const NOT_FOUND: HttpResponse = {
    status: 404,
    body: { error: "Not found." },
};

// A network that answers from a table and remembers what was sent, so a test
// can assert on the requests without mocking any global.
export const createFakeHttp = (routes: FakeHttpRoutes = {}) => {
    const requests: HttpRequest[] = [];
    const transport = vi.fn(async (request: HttpRequest) => {
        requests.push(request);
        const { pathname, search } = new URL(request.url);
        const answer = routes[`${request.method} ${pathname}${search}`];
        if (answer instanceof Error) throw answer;
        return answer ?? NOT_FOUND;
    });
    return { transport, requests };
};
