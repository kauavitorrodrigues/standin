import type { AvatarBase } from "@standin/contracts";
import { BaseCard } from "./BaseCard";

type Props = { bases: AvatarBase[] };

const NoResults = () => (
    <p className="text-muted-foreground rounded-xl border border-dashed p-6 text-center text-sm">
        Nenhuma base para os filtros selecionados.
    </p>
);

export const BasesList = ({ bases }: Props) => {
    if (bases.length === 0) return <NoResults />;

    return (
        <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {bases.map((base) => (
                <BaseCard key={base.id} base={base} />
            ))}
        </ul>
    );
};
