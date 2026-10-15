// Library images are served by the API at `/files/:id`, with a long immutable
// cache. The path is relative, the client puts its API address in front.
export const buildFileUrl = (fileId: string): string => `/files/${fileId}`;
