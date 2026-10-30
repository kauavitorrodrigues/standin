const OPTION_END = "--";

// Known before the parse, so even a usage error comes out as JSON. What
// follows `--` is data, not a flag.
export const wantsJson = (argv: string[]): boolean => {
    const end: number = argv.indexOf(OPTION_END);
    if (end < 0) return argv.includes("--json");
    return argv.slice(0, end).includes("--json");
};
