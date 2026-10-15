import { formatLabel } from "@/utils/text";

type Props = { count: number };

export const TileSelectionCount = ({ count }: Props) => {
    if (count === 0) return null;

    return (
        <span className="text-foreground shrink-0">
            {formatLabel(count, "selecionado", { plural: "selecionados" })}
        </span>
    );
};
