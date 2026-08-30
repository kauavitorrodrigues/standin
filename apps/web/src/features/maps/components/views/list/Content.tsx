import type { MapEntity } from "@standin/contracts";
import { MapCard } from "@/features/maps/components/views/card/MapCard";
import {
    MapsEmptyState,
    MapsErrorState,
} from "@/features/maps/components/views/list/ContentStates";

type Props = {
    maps: MapEntity[];
    isLoading: boolean;
    isError: boolean;
};

export const Content = ({ maps, isLoading, isError }: Props) => {
    if (isLoading) return null;
    if (isError) return <MapsErrorState />;
    if (maps.length === 0) return <MapsEmptyState />;

    return (
        <div className="grid w-full grid-cols-3 gap-3 sm:grid-cols-4 lg:grid-cols-6">
            {maps.map((map) => (
                <MapCard key={map.id} map={map} />
            ))}
        </div>
    );
};
