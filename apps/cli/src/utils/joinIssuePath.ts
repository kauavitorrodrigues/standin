// A path into a JSON document as the issues of the CLI write it:
// `tilesets[0].file`.
export const joinIssuePath = (path: PropertyKey[]): string =>
    path.reduce<string>((joined, part) => {
        if (typeof part === "number") return `${joined}[${part}]`;
        if (joined === "") return String(part);
        return `${joined}.${String(part)}`;
    }, "");
