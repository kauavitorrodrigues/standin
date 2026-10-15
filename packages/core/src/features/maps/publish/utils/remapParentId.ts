export const remapParentId = (
    parentId: string | null,
    idMap: Record<string, string>
): string | null => {
    if (parentId === null) return null;

    return idMap[parentId] ?? parentId;
};
