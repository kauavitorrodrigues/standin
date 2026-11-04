export const ANNOUNCING_BANNER_TEXTS = {
    self: "Você está anunciando",
    stopButton: "Parar",
    shareVideoButton: "Compartilhar vídeo",
    stopShareVideoButton: "Parar de compartilhar",
    // Shown for someone whose name is not known.
    unknownName: "Alguém",
} as const;

// Anyone who is not exactly one person takes the plural, so it covers every
// plural category of the locale.
export const ANNOUNCING_VERBS: Record<Intl.LDMLPluralRule, string> = {
    zero: "estão anunciando",
    one: "está anunciando",
    two: "estão anunciando",
    few: "estão anunciando",
    many: "estão anunciando",
    other: "estão anunciando",
};
