type Props = {
    title: string;
    artists: string[];
};

// The title and the artists, cut short when they do not fit.
export const Details = ({ title, artists }: Props) => (
    <span className="flex min-w-0 flex-1 flex-col pr-6">
        <span className="truncate text-sm font-bold">{title}</span>
        <span className="truncate text-sm text-muted-foreground">
            {artists.join(", ")}
        </span>
    </span>
);
