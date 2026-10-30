import { BaseVersionInvalidError } from "../../../errors/BaseVersionInvalidError";
import { BASE_VERSION_PATTERN } from "../consts";

// The value of --base-version: a whole number from 1, as the server wants.
export const parseBaseVersion = (value: string): number => {
    if (!BASE_VERSION_PATTERN.test(value)) throw new BaseVersionInvalidError();
    return Number(value);
};
