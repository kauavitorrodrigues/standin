import { MapsQueries } from "@/features/maps/queries";
import { Content } from "@/features/maps/components/views/list/Content";

export const MapsList = () => {
    const { maps, isLoading, isError } = MapsQueries.useByOrganization();
    return <Content maps={maps} isLoading={isLoading} isError={isError} />;
};
