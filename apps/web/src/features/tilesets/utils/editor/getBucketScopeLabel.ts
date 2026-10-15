// What the bucket fills, said on the button that switches it.
export const getBucketScopeLabel = (contiguous: boolean): string => {
    if (contiguous) return "Só os vizinhos";
    return "Toda a folha";
};
