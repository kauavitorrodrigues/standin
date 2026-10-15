// Tells the frame around a thumbnail that its image is done (loaded, failed,
// or already in the cache), so the placeholder stops. It writes the DOM
// directly: a picture arriving never renders React.
export const markThumbnailLoaded = (image: HTMLImageElement | null): void => {
    image?.parentElement?.setAttribute("data-loaded", "true");
};
