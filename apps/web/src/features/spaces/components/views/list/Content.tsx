import type { Space } from "@standin/contracts";
import { SpaceCard } from "@/features/spaces/components/views/card/SpaceCard";
import {
    SpacesEmptyState,
    SpacesErrorState,
} from "@/features/spaces/components/views/list/ContentStates";

type Props = {
    spaces: Space[];
    isLoading: boolean;
    isError: boolean;
};

export const Content = ({ spaces, isLoading, isError }: Props) => {
    if (isLoading) return null;
    if (isError) return <SpacesErrorState />;
    if (spaces.length === 0) return <SpacesEmptyState />;

    return (
        <div className="grid w-full grid-cols-3 gap-3 sm:grid-cols-4 lg:grid-cols-6">
            {spaces.map((space) => (
                <SpaceCard key={space.id} space={space} />
            ))}
        </div>
    );
};
