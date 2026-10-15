import { createTemplate } from "./create";
import { listTemplates } from "./list";
import { listPublishedTemplates } from "./listPublished";
import { findTemplateById } from "./findById";
import { updateTemplate } from "./update";
import { setTemplateThumbnail } from "./setThumbnail";
import { publishTemplate } from "./publish";
import { retireTemplate } from "./retire";
import { deleteTemplate } from "./delete";
import { findAvailableTemplate } from "./findAvailable";

export const MapTemplateService = {
    create: createTemplate,
    list: listTemplates,
    listPublished: listPublishedTemplates,
    findById: findTemplateById,
    update: updateTemplate,
    setThumbnail: setTemplateThumbnail,
    publish: publishTemplate,
    retire: retireTemplate,
    delete: deleteTemplate,
    findAvailable: findAvailableTemplate,
};
