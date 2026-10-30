import type { TemplateSpec } from "@standin/authoring";
import type { MapTemplate } from "@standin/contracts";
import { STEP_ACTIONS, STEP_TARGETS } from "../../../consts/steps";
import type {
    PngFile,
    StepRef,
    TemplateCreatedAnswer,
    TemplateFlow,
    TemplateInput,
    TemplateOutcome,
} from "../../../types";
import { recordStep } from "../../shared/recordStep";
import { trackWrite } from "../../shared/trackWrite";
import { applyTemplateSpec } from "./applyTemplateSpec";
import { createTemplateOnServer } from "./createTemplateOnServer";
import { publishTemplateOnServer } from "./publishTemplateOnServer";
import { uploadThumbnail } from "./uploadThumbnail";

// Makes a template: creates it, applies the spec to its map, uploads the
// thumbnail and, when asked, publishes it. Each step that wrote is recorded
// in the progress as soon as it is done, so a failure can say what stays on
// the instance. The template is `unfinished` until the last step is done.
export const buildTemplate = async (
    { http, target, progress }: TemplateFlow,
    input: TemplateInput
): Promise<TemplateOutcome> => {
    const step: StepRef = { target: STEP_TARGETS.TEMPLATE, name: input.name };
    const created: TemplateCreatedAnswer = await trackWrite(
        progress,
        step,
        () => createTemplateOnServer(http, target, input)
    );
    const { templateId, mapId }: TemplateCreatedAnswer = created;
    let template: MapTemplate = created.template;
    recordStep(progress, step, STEP_ACTIONS.CREATED, templateId);
    progress.unfinished = { name: input.name, id: templateId };

    const outcome: TemplateOutcome = {
        template,
        mapId,
        thumbnailUploaded: false,
        published: false,
    };
    if (input.spec) {
        const spec: TemplateSpec = input.spec;
        outcome.opCount = await applyTemplateSpec(
            { http, target, progress },
            step,
            spec,
            mapId
        );
        recordStep(progress, step, STEP_ACTIONS.SPEC_APPLIED, templateId);
    }
    if (input.thumbnail) {
        const thumbnail: PngFile = input.thumbnail;
        await trackWrite(progress, step, () =>
            uploadThumbnail(http, target, templateId, thumbnail)
        );
        outcome.thumbnailUploaded = true;
        recordStep(progress, step, STEP_ACTIONS.THUMBNAIL_UPLOADED, templateId);
    }
    if (input.publish) {
        template = await trackWrite(progress, step, () =>
            publishTemplateOnServer(http, target, templateId)
        );
        outcome.published = true;
        recordStep(progress, step, STEP_ACTIONS.PUBLISHED, templateId);
    }
    progress.unfinished = undefined;
    outcome.template = template;
    return outcome;
};
