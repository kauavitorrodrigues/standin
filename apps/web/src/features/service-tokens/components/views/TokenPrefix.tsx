type Props = { prefix: string };

// The part of the token the list knows, then dots for the hidden rest.
export const TokenPrefix = ({ prefix }: Props) => (
    <code className="font-mono text-xs whitespace-nowrap">
        {prefix}
        <span aria-hidden className="text-muted-foreground">
            ••••
        </span>
    </code>
);
