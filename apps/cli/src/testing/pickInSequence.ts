import type { HttpRequest, HttpResponse } from "../types";

// The answer a route gives this time: its list is read in order, and the last
// answer repeats once the list is used up.
export const pickInSequence = (
    answers: HttpResponse[],
    request: HttpRequest,
    counts: Map<string, number>
): HttpResponse => {
    const key: string = `${request.method} ${request.url}`;
    const seen: number = counts.get(key) ?? 0;
    counts.set(key, seen + 1);
    return answers[Math.min(seen, answers.length - 1)];
};
