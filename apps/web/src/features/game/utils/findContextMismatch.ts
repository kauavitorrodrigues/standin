import { GAME_CONTEXT_EXPECTED } from "@/features/game/consts/game-config";

type Attributes = Partial<
    Record<keyof typeof GAME_CONTEXT_EXPECTED, boolean | string>
>;

/**
 * The attributes of the context that are not what the game asked for, as
 * `name: expected, got`. Empty when they all match. The browser may give
 * something other than what was asked, so this is what tells it. An attribute
 * the browser does not report is not counted.
 */
export const findContextMismatch = (
    actual: WebGLContextAttributes | null | undefined
): string[] => {
    if (!actual) return ["no context attributes"];

    const read = actual as Attributes;
    return (
        Object.entries(GAME_CONTEXT_EXPECTED) as [
            keyof typeof GAME_CONTEXT_EXPECTED,
            boolean | string,
        ][]
    )
        .filter(
            ([name, expected]) =>
                read[name] !== undefined && read[name] !== expected
        )
        .map(([name, expected]) => `${name}: ${expected}, got ${read[name]}`);
};
