import { NO_VALIDITY } from "../consts/validity";

/** The value of the select for the hours of a link: none when it has no end. */
export const toValidityValue = (hours: number | null | undefined): string => {
    if (hours === null || hours === undefined) return NO_VALIDITY;
    return String(hours);
};

/** The hours of a select value: null for none. */
export const toValidityHours = (value: string): number | null => {
    if (value === NO_VALIDITY) return null;
    return Number(value);
};
