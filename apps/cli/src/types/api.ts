export type HttpMethod = "GET" | "POST";

export type HttpRequest = {
    method: HttpMethod;
    url: string;
    headers: Record<string, string>;
    body?: string;
};

// The body is what the server sent, read as JSON; undefined when it sent none
// or it was not JSON.
export type HttpResponse = {
    status: number;
    body: unknown;
    // Where a redirect points, as the server sent it.
    location?: string;
};

// The fetch of Node, or one a test hands in.
export type FetchFunction = typeof fetch;

// Sends one request. It throws when the server cannot be reached.
export type HttpTransport = (request: HttpRequest) => Promise<HttpResponse>;

// One call of the API, before the base URL and the token are applied.
export type ApiCall = {
    method: HttpMethod;
    path: string;
    query?: Record<string, string | number>;
    body?: object;
};

// The body of an error of the API: `{ error, code }` plus what the error
// adds. Every field may be missing, a proxy can answer with anything.
export type ApiErrorBody = {
    error?: string;
    code?: string;
    errors?: unknown;
    // The shape of a body that failed the schema (zod's flatten).
    fieldErrors?: Record<string, string[]>;
    formErrors?: string[];
    // The current version, on a stale layout.
    version?: number;
    // Who holds the lock and since when, on a locked map.
    by?: { id: string; name: string };
    since?: string;
};

// A failed answer, read once so each error class takes the same input.
export type ApiFailure = {
    status: number;
    code: string;
    message: string;
    body: ApiErrorBody;
};
