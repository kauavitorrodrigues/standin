const BYTES_IN_MB: number = 1024 * 1024;
const BYTES_IN_KB: number = 1024;

// A size for people: MB with one decimal, KB, or bytes.
export const formatBytes = (bytes: number): string => {
    if (bytes >= BYTES_IN_MB) return `${(bytes / BYTES_IN_MB).toFixed(1)} MB`;
    if (bytes >= BYTES_IN_KB) return `${Math.round(bytes / BYTES_IN_KB)} KB`;
    return `${bytes} B`;
};
