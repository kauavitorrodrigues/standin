/** A bundle is named by its position too, since its key can repeat. */
export const buildBundleLabel = (index: number, asset: string): string =>
    `bundles[${index}] "${asset}"`;
