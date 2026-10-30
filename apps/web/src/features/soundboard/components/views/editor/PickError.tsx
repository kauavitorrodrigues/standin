type Props = { message: string | null };

// Why the last file could not be opened, when it could not.
export const PickError = ({ message }: Props) => {
    if (message === null) return null;

    return (
        <p className="text-destructive" role="alert">
            {message}
        </p>
    );
};
