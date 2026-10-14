import type { MapTemplate } from "@standin/contracts";
import { TemplatesGrid } from "../grid/Grid";
import {
    TemplatesEmptyState,
    TemplatesErrorState,
} from "./ContentStates";
import { TemplatesLoadingState } from "./LoadingState";

type Props = {
    templates: MapTemplate[];
    isLoading: boolean;
    isError: boolean;
};

export const Content = ({ templates, isLoading, isError }: Props) => {
    if (isLoading) return <TemplatesLoadingState />;
    if (isError) return <TemplatesErrorState />;
    if (templates.length === 0) return <TemplatesEmptyState />;

    return <TemplatesGrid templates={templates} />;
};
