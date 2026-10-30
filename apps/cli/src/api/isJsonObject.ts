// The body of a success of the API is always a JSON object.
export const isJsonObject = (body: unknown): boolean =>
    typeof body === "object" && body !== null;
