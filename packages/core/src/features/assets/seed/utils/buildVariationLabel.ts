/** A variation is named after its part. */
export const buildVariationLabel = (
    partLabel: string,
    colorKey: string
): string => `${partLabel} variation "${colorKey}"`;
