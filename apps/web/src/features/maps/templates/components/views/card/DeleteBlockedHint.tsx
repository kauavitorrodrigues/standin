type Props = { blocked: boolean };

// Why the delete item is disabled, shown only when it is.
export const DeleteBlockedHint = ({ blocked }: Props) => {
    if (!blocked) return null;
    return (
        <span className="text-muted-foreground text-xs">
            Aposente o template antes de apagar
        </span>
    );
};
