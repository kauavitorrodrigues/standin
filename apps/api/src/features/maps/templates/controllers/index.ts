import { listTemplates } from "./list";
import { getTemplate } from "./details";
import { createTemplate } from "./create";
import { updateTemplate } from "./update";
import { setTemplateThumbnail } from "./setThumbnail";
import { publishTemplate } from "./publish";
import { retireTemplate } from "./retire";
import { deleteTemplate } from "./delete";

export const TemplateController = {
    list: listTemplates,
    details: getTemplate,
    create: createTemplate,
    update: updateTemplate,
    setThumbnail: setTemplateThumbnail,
    publish: publishTemplate,
    retire: retireTemplate,
    delete: deleteTemplate,
};
