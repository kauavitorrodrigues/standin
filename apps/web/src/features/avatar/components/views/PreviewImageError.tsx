type PreviewImageErrorProps = { hasError: boolean };

// Some sheet of the draft did not load. The preview keeps showing the others.
export const PreviewImageError = ({ hasError }: PreviewImageErrorProps) => {
    if (!hasError) return null;

    return (
        <p className="text-center text-xs text-destructive">
            Algumas peças não carregaram e ficaram fora da pré-visualização.
        </p>
    );
};
