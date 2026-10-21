export type ImageSize = { width: number; height: number };

/**
 * The size the browser decodes a chosen photo to, or null when it cannot read
 * it. Only the form uses it, to frame the photo and to warn early. The server
 * still decides on the bytes.
 */
export const readImageSize = (file: File): Promise<ImageSize | null> =>
    new Promise((resolve) => {
        const url = URL.createObjectURL(file);
        const image = new Image();

        image.onload = () => {
            URL.revokeObjectURL(url);
            resolve({ width: image.naturalWidth, height: image.naturalHeight });
        };
        image.onerror = () => {
            URL.revokeObjectURL(url);
            resolve(null);
        };
        image.src = url;
    });
