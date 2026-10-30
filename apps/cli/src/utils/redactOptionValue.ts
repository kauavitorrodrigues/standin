const OPTION_VALUE = /(--[\w-]+)=[^\s'"]+/g;

// A typo such as `--pasword=secret` must not be echoed back with its value.
export const redactOptionValue = (message: string): string =>
    message.replace(OPTION_VALUE, "$1=<hidden>");
