import { useState } from "react";
import { API_BASE_URL } from "@/lib/api/url";
import { getThumbnailSrc } from "@/features/maps/templates/utils/getThumbnailSrc";

const PhotoImage = ({ src }: { src: string }) => {
    const [failed, setFailed] = useState(false);

    if (failed) return null;

    return (
        <img
            src={src}
            alt=""
            loading="lazy"
            draggable={false}
            onError={() => setFailed(true)}
            className="absolute inset-0 size-full rounded-xl object-cover"
        />
    );
};

// The photo of the map, filling the card. Nothing without one, or when it does
// not load, and the gradient behind it is what shows. Keyed by address, so a
// new photo gets its own try.
export function Thumbnail({ url }: { url: string | null }) {
    const src = getThumbnailSrc(url, API_BASE_URL);

    if (!src) return null;

    return <PhotoImage key={src} src={src} />;
}
