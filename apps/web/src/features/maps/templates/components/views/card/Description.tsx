type Props = { description: string | null };

export const TemplateDescription = ({ description }: Props) => {
    if (!description) return null;

    return (
        <p className="line-clamp-2 text-xs text-muted-foreground">{description}</p>
    );
};
