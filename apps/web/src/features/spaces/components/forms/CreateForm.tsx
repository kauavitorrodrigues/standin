import { useForm } from "react-hook-form";
import { useNavigate } from "@tanstack/react-router";
import { toast } from "@/components/ui/toast";
import { Button } from "@/components/ui/button";
import { zodResolver } from "@hookform/resolvers/zod";
import {
    ENABLED_SIZE_TIERS,
    SpaceDataSchema,
    type SpaceDataSchemaType,
} from "@standin/contracts";
import { SpaceFormFields } from "../fields/FormFields";
import { SpaceMutations } from "../../mutations";
import { SpacesQueries } from "../../queries";
import { CreateMessages } from "./Messages";

export const CreateSpaceForm = () => {
    const navigate = useNavigate();
    const createMutation = SpaceMutations.create();
    const spacesQueryUtils = SpacesQueries.useByOrganizationUtils();

    const form = useForm<SpaceDataSchemaType>({
        resolver: zodResolver(SpaceDataSchema),
        // The map flow is not built on the client yet. Until then every new
        // space starts from a blank map of the smallest enabled tier.
        defaultValues: { name: "", sizeTier: ENABLED_SIZE_TIERS[0] },
    });

    const onSubmit = async (data: SpaceDataSchemaType) => {
        try {
            const space = await createMutation.mutateAsync(data);
            toast.add({ title: CreateMessages.success, type: "success" });
            spacesQueryUtils.invalidate();
            navigate({ to: "/spaces/$spaceId", params: { spaceId: space.id } });
        } catch {
            toast.add({ title: CreateMessages.error, type: "error" });
        }
    };

    const { isSubmitting } = form.formState;

    return (
        <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="mx-auto flex w-full max-w-xl flex-1 flex-col justify-center gap-8"
        >
            <SpaceFormFields form={form} disabled={isSubmitting} />

            <div className="flex justify-end gap-2">
                <Button
                    type="button"
                    variant="outline"
                    disabled={isSubmitting}
                    onClick={() => navigate({ to: "/home" })}
                >
                    Cancelar
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                    Criar espaço
                </Button>
            </div>
        </form>
    );
};
