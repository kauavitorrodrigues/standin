import { queryOptions, useQuery } from "@tanstack/react-query";

export type ImageSize = { w: number; h: number };

// Size of a local image, read by the browser.
export const readImageSize = async (file: File): Promise<ImageSize> => {
    const bitmap = await createImageBitmap(file);
    const size = { w: bitmap.width, h: bitmap.height };
    bitmap.close();
    return size;
};

// The file's own properties key the query, so choosing the same file again
// does not read it twice.
export const imageSizeQueryOptions = (file: File | undefined) =>
    queryOptions({
        queryKey: ["imageSize", file?.name, file?.size, file?.lastModified],
        queryFn: () => readImageSize(file!),
        enabled: file !== undefined,
        staleTime: Infinity,
    });

export const useImageSize = (file: File | undefined) =>
    useQuery(imageSizeQueryOptions(file));
