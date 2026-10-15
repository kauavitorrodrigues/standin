// The id an object has in the draft until the publish gives it a real one.
export const createTempId = (): string => `tmp_${crypto.randomUUID()}`;
