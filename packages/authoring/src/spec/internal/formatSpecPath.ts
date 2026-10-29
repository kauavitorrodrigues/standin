// The path of a value in the spec, written the way people read it:
// `rooms[1].doors[0].side`.
export const formatSpecPath = (path: readonly PropertyKey[]): string =>
    path.reduce<string>((text, part) => {
        if (typeof part === "number") return `${text}[${part}]`;
        return text === "" ? String(part) : `${text}.${String(part)}`;
    }, "");
