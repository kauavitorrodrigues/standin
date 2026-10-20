import { useAvatarParts } from "../../../queries/admin/useAvatarParts";
import {
    NewColorErrorState,
    NewColorLoadingState,
} from "../../views/admin/NewColorStates";
import { NewColorBody } from "./NewColorBody";

type Props = { partId: string | undefined };

// The body of the page of a new color: the parts are loaded and the one that
// gets the color comes from the URL.
export const NewColorContent = ({ partId }: Props) => {
    const { slots, isLoading, isError } = useAvatarParts();

    if (isLoading) return <NewColorLoadingState />;
    if (isError) return <NewColorErrorState />;

    return (
        <div className="mx-auto flex w-full max-w-4xl flex-1 flex-col gap-6">
            <NewColorBody slots={slots} partId={partId} />
        </div>
    );
};
