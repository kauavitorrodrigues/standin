/** Copies text to the clipboard. Throws when the browser refuses. */
export const copyText = async (text: string): Promise<void> => {
    await navigator.clipboard.writeText(text);
};
