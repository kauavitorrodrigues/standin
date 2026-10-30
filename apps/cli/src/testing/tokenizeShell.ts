// Splits a shell line into words. Quotes group a word and are dropped, a
// backslash outside quotes escapes the next character, and an unquoted `#` at
// the start of a word begins a comment that ends the line.
export const tokenizeShell = (line: string): string[] => {
    const words: string[] = [];
    let word: string | null = null;
    let quote: string | null = null;

    for (let index = 0; index < line.length; index++) {
        const char: string = line.charAt(index);
        if (quote !== null) {
            if (char === quote) {
                quote = null;
                continue;
            }
            word = (word ?? "") + char;
            continue;
        }
        if (char === "'" || char === '"') {
            quote = char;
            word = word ?? "";
            continue;
        }
        if (char === "\\") {
            index++;
            word = (word ?? "") + (line[index] ?? "");
            continue;
        }
        if (char === "#" && word === null) break;
        if (char === " " || char === "\t") {
            if (word !== null) words.push(word);
            word = null;
            continue;
        }
        word = (word ?? "") + char;
    }
    if (word !== null) words.push(word);
    return words;
};
