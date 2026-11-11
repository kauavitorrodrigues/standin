type Props = {
    url: string | null;
};

// The cover of the album. Without one the square stays as a placeholder.
export const Cover = ({ url }: Props) => (
    <span className="size-14 shrink-0 overflow-hidden rounded-lg bg-muted">
        {url && (
            <img
                src={url}
                alt=""
                className="size-full object-cover"
                referrerPolicy="no-referrer"
            />
        )}
    </span>
);
