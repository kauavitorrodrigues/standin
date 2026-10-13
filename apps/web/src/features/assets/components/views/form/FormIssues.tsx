type Props = {
    // The messages of the form that matched no field, one per line.
    message: string | undefined;
};

// The problems of the form that belong to no field, above the form.
export const FormIssues = ({ message }: Props) => {
    if (!message) return null;
    const lines = message.split("\n");

    return (
        <ul className="text-destructive flex flex-col gap-1 text-sm">
            {lines.map((line) => (
                <li key={line}>{line}</li>
            ))}
        </ul>
    );
};
