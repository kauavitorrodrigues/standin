const fileIds = new WeakMap<File, number>();
let lastId = 0;

// A number that stands for one File object, so a query can be keyed by the
// file the person chose. Another pick gives another File, hence another id.
export const getFileId = (file: File): number => {
    const known = fileIds.get(file);
    if (known !== undefined) return known;

    lastId += 1;
    fileIds.set(file, lastId);
    return lastId;
};
