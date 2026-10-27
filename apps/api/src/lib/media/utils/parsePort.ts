const MAX_PORT = 65535;

/**
 * Reads a TCP or UDP port from the text of an environment variable.
 *
 * @returns The port, or `fallback` when the text is missing or not a port.
 */
export const parsePort = (
    text: string | undefined,
    fallback: number
): number => {
    const port = Number(text);
    const isPort = Number.isInteger(port) && port > 0 && port <= MAX_PORT;
    return isPort ? port : fallback;
};
