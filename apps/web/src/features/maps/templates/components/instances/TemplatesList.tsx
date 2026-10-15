import { TemplatesQueries } from "../../queries";
import { Content } from "../views/list/Content";

export const TemplatesList = () => {
    const { templates, isLoading, isError } = TemplatesQueries.useAll();
    return (
        <Content
            templates={templates}
            isLoading={isLoading}
            isError={isError}
        />
    );
};
