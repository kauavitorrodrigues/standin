type Props = { reason: string | null };

// Why the clips cannot be played right now, when they cannot.
export const DisabledNotice = ({ reason }: Props) => {
    if (reason === null) return null;

    return (
        <p className="rounded-md bg-muted px-2 py-1 text-xs text-muted-foreground">
            {reason}
        </p>
    );
};
