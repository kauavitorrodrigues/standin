import type { CustomStatus } from "@standin/contracts";

type Props = { customStatus: CustomStatus | null };

/** The emoji and the text a person set to say what they are up to. */
export const CustomStatusLine = ({ customStatus }: Props) => {
    if (!customStatus) return null;

    return (
        <p className="flex items-start gap-1.5 text-sm leading-4 text-muted-foreground">
            <span aria-hidden>{customStatus.emoji}</span>
            <span className="min-w-0 break-words">{customStatus.text}</span>
        </p>
    );
};
