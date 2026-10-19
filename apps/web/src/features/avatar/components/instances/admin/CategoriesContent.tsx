import type { AvatarCategory } from "@standin/contracts";
import { CategoriesList } from "../../views/admin/CategoriesList";
import {
    CategoriesErrorState,
    CategoriesLoadingState,
} from "../../views/admin/CategoriesStates";

type Props = {
    categories: AvatarCategory[];
    isLoading: boolean;
    isError: boolean;
};

// The body of the page: the state that fits, or the categories in order.
export const CategoriesContent = ({
    categories,
    isLoading,
    isError,
}: Props) => {
    if (isLoading) return <CategoriesLoadingState />;
    if (isError) return <CategoriesErrorState />;

    return <CategoriesList categories={categories} />;
};
