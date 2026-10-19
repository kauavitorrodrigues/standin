import type { AvatarPart } from "@standin/contracts";
import { PartCard } from "./PartCard";

type Props = { parts: AvatarPart[] };

const NoResults = () => (
    <p className="text-muted-foreground rounded-xl border border-dashed p-6 text-center text-sm">
        Nenhuma peça para os filtros selecionados.
    </p>
);

export const PartsList = ({ parts }: Props) => {
    if (parts.length === 0) return <NoResults />;

    return (
        <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {parts.map((part) => (
                <PartCard key={part.id} part={part} />
            ))}
        </ul>
    );
};
