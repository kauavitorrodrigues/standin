import { SpacesQueries } from "@/features/spaces/queries";
import { Content } from "@/features/spaces/components/views/list/Content";

export const SpacesList = () => {
    const { spaces, isLoading, isError } = SpacesQueries.useByOrganization();
    return (
        <Content spaces={spaces} isLoading={isLoading} isError={isError} />
    );
};