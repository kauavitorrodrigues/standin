function pluralizePhrase(phrase: string, suffix: string): string {
    return phrase
        .split(" ")
        .map((word) => (word.endsWith(suffix) ? word : `${word}${suffix}`))
        .join(" ");
}

type GetLabelOptions = {
    pluralSuffix?: string;
    singular?: string;
    plural?: string;
};

// "1 item", "5 itens": the count followed by the phrase in the right number.
export function formatLabel(
    total: number,
    phrase: string,
    options: GetLabelOptions = {}
) {
    const { pluralSuffix = "s", singular, plural } = options;

    if (total === 1) {
        return `${total} ${singular || phrase}`;
    }

    return `${total} ${plural || pluralizePhrase(phrase, pluralSuffix)}`;
}
