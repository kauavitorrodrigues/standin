// The scanner behind `avatarSizeLiterals.test.ts`, kept apart so the test can
// also prove that it catches a literal.

// Sizes the avatar has or had in the grid: the frame (32 x 48), the body
// (24 x 16) and the numbers around them. A bare number like these, in a line
// that talks about an avatar, is a size that should come from `AVATAR`.
const SIZE_LITERALS = "32|48|24|16";

// Words that make a line be about the size or the place of an avatar.
const AVATAR_CONTEXT =
    /avatar|player|frameWidth|frameHeight|setOrigin|setSize|body|nameTag|feetY|ghost|mannequin/i;

// A whole number, not part of a longer one, a hex color, a unit or a decimal.
const SIZE_LITERAL = new RegExp(`(?<![\\w.#$-])(${SIZE_LITERALS})(?![\\w.%])`);

// A line with this marker is left alone. Say why after it.
export const ALLOW_MARKER = "avatar-size-ok";

export type AvatarSizeHit = {
    line: number;
    text: string;
};

const isCommentLine = (text: string): boolean =>
    text.startsWith("//") || text.startsWith("*") || text.startsWith("/*");

/**
 * Finds the lines of a source file that write a size of the avatar as a
 * literal. Comments are ignored, and so are lines with `TILE_SIZE`, because
 * the size of a tile is not the size of an avatar.
 */
export const findAvatarSizeLiterals = (source: string): AvatarSizeHit[] =>
    source.split("\n").flatMap((rawLine, index) => {
        if (rawLine.includes(ALLOW_MARKER)) return [];

        const text = rawLine.trim();
        if (isCommentLine(text)) return [];

        const code = text.replace(/\/\/.*$/, "");
        if (code.includes("TILE_SIZE")) return [];
        if (!AVATAR_CONTEXT.test(code)) return [];
        if (!SIZE_LITERAL.test(code)) return [];

        return [{ line: index + 1, text }];
    });
