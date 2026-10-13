import { TilesetsErrorState } from "../list/ErrorState";
import { TilesetsLoadingState } from "../list/LoadingState";

type Props = {
    isLoading: boolean;
    isError: boolean;
};

// What the page of a tileset shows while there is no tileset to edit yet.
export const TilesetDetailStatus = ({ isLoading, isError }: Props) => {
    if (isLoading) return <TilesetsLoadingState />;
    if (isError) return <TilesetsErrorState />;
    return null;
};
