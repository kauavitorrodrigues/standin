const requested = new Set<string>();

// Starts the download of images the user is about to see, so they are in the
// cache when they show. An address is requested once per page, and the
// browser cache answers the rest.
export const preloadImages = (urls: readonly string[]): void => {
    for (const url of urls) {
        if (requested.has(url)) continue;
        requested.add(url);
        new Image().src = url;
    }
};
