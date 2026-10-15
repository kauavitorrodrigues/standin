import type { AreaSummary } from "@standin/contracts";
import { AreaCard } from "../card/Card";

type Props = { areas: AreaSummary[] };

export const AreasGrid = ({ areas }: Props) => (
    <div className="grid grid-cols-[repeat(auto-fill,minmax(14rem,1fr))] gap-3">
        {areas.map((area) => (
            <AreaCard key={area.id} area={area} />
        ))}
    </div>
);
