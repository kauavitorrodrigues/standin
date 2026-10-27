// The media library gives typed objects that travel as plain JSON, and the
// contract names them as records.
export const toPlain = <T>(value: unknown): T => value as T;
