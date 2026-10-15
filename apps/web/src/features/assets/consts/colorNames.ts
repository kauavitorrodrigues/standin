// Names offered for a color taken from an image. Keys follow the pattern of
// a color key (lowercase, no accents), the hex is the reference of the name.
export const COLOR_NAMES = [
    { key: "vermelho", hex: "#DC2626" },
    { key: "laranja", hex: "#F97316" },
    { key: "amarelo", hex: "#EAB308" },
    { key: "verde", hex: "#16A34A" },
    { key: "verde-claro", hex: "#86EFAC" },
    { key: "azul", hex: "#2563EB" },
    { key: "azul-claro", hex: "#7DD3FC" },
    { key: "roxo", hex: "#9333EA" },
    { key: "rosa", hex: "#EC4899" },
    { key: "marrom", hex: "#78350F" },
    { key: "bege", hex: "#D6B98C" },
    { key: "branco", hex: "#F5F5F5" },
    { key: "cinza", hex: "#6B7280" },
    { key: "preto", hex: "#171717" },
] as const;

// Pixels coarser than this many levels per channel count as the same color
// when looking for the predominant one.
export const COLOR_BUCKET_SIZE = 16;

// Pixels more transparent than this do not count.
export const MIN_COLOR_ALPHA = 128;

// Largest side of the copy of the image the color is read from.
export const COLOR_SAMPLE_MAX_PX = 128;
