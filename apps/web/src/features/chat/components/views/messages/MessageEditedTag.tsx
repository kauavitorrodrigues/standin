type Props = { editedAt: string | null };

export const MessageEditedTag = ({ editedAt }: Props) => {
    if (!editedAt) return null;
    return (
        <span className="ml-1 text-xs text-muted-foreground">(editado)</span>
    );
};
