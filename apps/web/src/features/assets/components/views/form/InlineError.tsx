type Props = { message: string | undefined };

// One error, under what it is about.
export const InlineError = ({ message }: Props) => {
    if (!message) return null;
    return <p className="text-destructive text-sm">{message}</p>;
};
