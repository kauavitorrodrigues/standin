import { MapsQueries } from "@/features/maps/queries";
import { SelectableMapCard } from "@/features/maps/components/views/card/SelectableMapCard";
import {
    MapsEmptyState,
    MapsErrorState,
} from "@/features/maps/components/views/list/ContentStates";

type Props = {
    value: string | null;
    onChange: (mapId: string) => void;
};

export function MapSelectionGrid({ value, onChange }: Props) {
    const { maps, isLoading, isError } = MapsQueries.useByOrganization();

    if (isLoading) return null;
    if (isError) return <MapsErrorState />;
    if (maps.length === 0) return <MapsEmptyState />;

    return (
        <div className="grid w-full grid-cols-2 gap-3 sm:grid-cols-3">
            {maps.map((map) => (
                <SelectableMapCard
                    key={map.id}
                    map={map}
                    selected={map.id === value}
                    onSelect={() => onChange(map.id)}
                />
            ))}
        </div>
    );
}
