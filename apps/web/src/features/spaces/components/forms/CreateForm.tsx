import { useForm } from "react-hook-form";
import { useNavigate } from "@tanstack/react-router";
import { zodResolver } from "@hookform/resolvers/zod";
import { ENABLED_SIZE_TIERS } from "@standin/contracts";
import { toast } from "@/components/ui/toast";
import { Button } from "@/components/ui/button";
import { TemplatesQueries } from "@/features/maps/templates/queries";
import {
    CreateSpaceFormSchema,
    toSpaceData,
    type CreateSpaceFormValues,
} from "../../schemas/createSpaceForm";
import { StepFields } from "../instances/create/StepFields";
import { StepHeader } from "../views/create/StepHeader";
import { StepIntro } from "../views/create/StepIntro";
import { SpacePreview } from "../views/create/SpacePreview";
import { useCreateSpaceStep } from "../../hooks/useCreateSpaceStep";
import { shouldChooseMap } from "../../utils/shouldChooseMap";
import { getSubmitLabel } from "../../utils/getSubmitLabel";
import { useSpaceSourceSelection } from "../../hooks/useSpaceSourceSelection";
import { useCaptureSpaceThumbnail } from "../../hooks/useCaptureSpaceThumbnail";
import { SpaceMutations } from "../../mutations";
import { SpacesQueries } from "../../queries";
import { CreateMessages } from "./Messages";

// Two halves: the choices on the left,
// the map the space will start from on the right.
export const CreateSpaceForm = () => {
    const navigate = useNavigate();
    const createMutation = SpaceMutations.create();
    const spacesQueryUtils = SpacesQueries.useByOrganizationUtils();
    const captureThumbnail = useCaptureSpaceThumbnail();
    const { templates, isLoading } = TemplatesQueries.useAll();
    const { step, goToSize, goToMap } = useCreateSpaceStep();

    const form = useForm<CreateSpaceFormValues>({
        resolver: zodResolver(CreateSpaceFormSchema),
        defaultValues: { name: "", tier: ENABLED_SIZE_TIERS[0] },
    });
    const { tier, templateId, tierTemplates } = useSpaceSourceSelection(
        form,
        templates
    );
    const goesToMap = shouldChooseMap(step, tierTemplates.length > 0);

    const onSubmit = async (values: CreateSpaceFormValues) => {
        if (goesToMap) return goToMap();

        try {
            const space = await createMutation.mutateAsync(toSpaceData(values));
            toast.add({ title: CreateMessages.success, type: "success" });
            spacesQueryUtils.invalidate();
            // Left running as the page changes: the photo is a bonus, and the
            // card takes it when it lands. It never fails, and without one the
            // editor makes it on the first visit.
            void captureThumbnail({
                spaceId: space.id,
                templateId: values.templateId,
                tier: values.tier,
            });
            navigate({ to: "/spaces/$spaceId", params: { spaceId: space.id } });
        } catch {
            toast.add({ title: CreateMessages.error, type: "error" });
        }
    };

    const { isSubmitting } = form.formState;

    return (
        <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="flex h-full min-h-0 w-full"
        >
            <aside className="flex w-full max-w-md shrink-0 flex-col bg-muted/40">
                <div className="p-6">
                    <StepHeader step={step} onBack={goToSize} />
                </div>

                <div className="px-6 pb-4">
                    <StepIntro step={step} />
                </div>

                <div className="flex min-h-0 flex-1 flex-col gap-6 overflow-y-auto px-6 pb-4">
                    <StepFields
                        form={form}
                        templates={templates}
                        step={step}
                        isLoading={isLoading}
                        disabled={isSubmitting}
                    />
                </div>

                <div className="p-6">
                    <Button
                        type="submit"
                        size="lg"
                        className="h-10 w-full"
                        isLoading={isSubmitting}
                        disabled={isLoading}
                    >
                        {getSubmitLabel(goesToMap)}
                    </Button>
                </div>
            </aside>

            <section className="min-w-0 flex-1 bg-gradient-to-b from-primary/5 to-primary/15 p-12">
                <SpacePreview
                    templates={templates}
                    templateId={templateId}
                    sizeTier={tier}
                    isLoading={isLoading}
                />
            </section>
        </form>
    );
};
