type Props = { reason: string | null };

// Why the clip cannot be sent yet, when it cannot.
export const BlockReason = ({ reason }: Props) => {
    if (reason === null) return null;

    return <p className="text-xs text-muted-foreground">{reason}</p>;
};
