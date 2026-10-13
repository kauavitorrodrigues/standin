type Props = { show: boolean };

// What the list of seats says while no seat was marked.
export const SeatsEmptyState = ({ show }: Props) => {
    if (!show) return null;

    return (
        <p className="text-muted-foreground flex h-full items-center justify-center text-sm">
            Nenhum assento marcado.
        </p>
    );
};
