import { MAX_PUBLISH_OPS } from "@standin/contracts";

type PublishLimitWarningProps = {
    visible: boolean;
    opCount: number;
};

// Warns when the draft is close to what one publish accepts.
export const PublishLimitWarning = ({
    visible,
    opCount,
}: PublishLimitWarningProps) => {
    if (!visible) return null;

    return (
        <p
            role="alert"
            className="rounded-lg bg-amber-500/15 px-3 py-2 text-sm text-amber-700 dark:text-amber-300"
        >
            Este rascunho já tem {opCount} de {MAX_PUBLISH_OPS} operações.
            Publique agora para não passar do limite.
        </p>
    );
};
