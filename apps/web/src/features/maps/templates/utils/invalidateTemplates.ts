import type { QueryClient } from "@tanstack/react-query";
import { TEMPLATES_QUERY_KEY } from "../queries/useAll";
import { TEMPLATE_DETAILS_QUERY_KEY } from "../queries/useDetails";

// Everything that shows the templates: the list and the detail of each.
export const invalidateTemplates = (queryClient: QueryClient) =>
    Promise.all([
        queryClient.invalidateQueries({ queryKey: [TEMPLATES_QUERY_KEY] }),
        queryClient.invalidateQueries({
            queryKey: [TEMPLATE_DETAILS_QUERY_KEY],
        }),
    ]);
