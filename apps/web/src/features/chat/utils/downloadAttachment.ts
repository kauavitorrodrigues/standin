// The API and the web app run on different origins, so an anchor's
// `download` attribute is silently ignored by the browser (it only applies
// to same-origin links) and clicking one just opens the file in a new tab
// instead. Fetching it into a blob first sidesteps that: a blob: URL is
// always same-origin, so `download` works on it.
export const downloadAttachment = async (url: string, filename: string) => {
    const response = await fetch(url, { credentials: "include" });
    if (!response.ok) throw new Error("Failed to download attachment");

    const blob = await response.blob();
    const objectUrl = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = objectUrl;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    link.remove();

    URL.revokeObjectURL(objectUrl);
};
