// Pages of these providers refuse to be framed at their usual address, but
// serve an embeddable twin of it. Unknown hosts are returned untouched.
const YOUTUBE_HOSTS = ["youtube.com", "www.youtube.com", "m.youtube.com"];
const GOOGLE_DOC_KINDS: Record<string, string> = {
    document: "preview",
    spreadsheets: "preview",
    presentation: "embed",
};

const rewriteYoutube = (url: URL): string | null => {
    if (url.hostname === "youtu.be") {
        const id = url.pathname.slice(1);
        return id ? `https://www.youtube.com/embed/${id}` : null;
    }
    if (!YOUTUBE_HOSTS.includes(url.hostname)) return null;
    const id = url.searchParams.get("v");
    return id ? `https://www.youtube.com/embed/${id}` : null;
};

const rewriteVimeo = (url: URL): string | null => {
    if (url.hostname !== "vimeo.com" && url.hostname !== "www.vimeo.com") {
        return null;
    }
    const id = url.pathname.match(/^\/(\d+)\/?$/)?.[1];
    return id ? `https://player.vimeo.com/video/${id}` : null;
};

const rewriteLoom = (url: URL): string | null => {
    if (url.hostname !== "loom.com" && url.hostname !== "www.loom.com") {
        return null;
    }
    const id = url.pathname.match(/^\/share\/([\w-]+)\/?$/)?.[1];
    return id ? `https://www.loom.com/embed/${id}` : null;
};

const rewriteGoogleDocs = (url: URL): string | null => {
    if (url.hostname !== "docs.google.com") return null;
    const match = url.pathname.match(
        /^\/(document|spreadsheets|presentation)\/d\/([\w-]+)/
    );
    if (!match) return null;
    return `https://docs.google.com/${match[1]}/d/${match[2]}/${GOOGLE_DOC_KINDS[match[1]]}`;
};

const REWRITERS = [
    rewriteYoutube,
    rewriteVimeo,
    rewriteLoom,
    rewriteGoogleDocs,
];

export const toEmbeddableUrl = (url: URL): string => {
    for (const rewrite of REWRITERS) {
        const rewritten = rewrite(url);
        if (rewritten) return rewritten;
    }
    return url.toString();
};
