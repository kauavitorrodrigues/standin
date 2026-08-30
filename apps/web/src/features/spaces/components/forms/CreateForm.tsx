import { useForm, useWatch } from "react-hook-form";
import { useNavigate } from "@tanstack/react-router";
import { toast } from "@/components/ui/toast";
import { Button } from "@/components/ui/button";
import { zodResolver } from "@hookform/resolvers/zod";
import {
    MAX_SPACE_NAME_LENGTH,
    SpaceDataSchema,
    type SpaceDataSchemaType,
} from "@standin/contracts";
import { TextFormField } from "@/components/fields/TextFormField";
import { GenericFormField } from "@/components/fields/GenericFormField";
import { MapSelectionGrid } from "@/features/maps/components/instances/MapSelectionGrid";
import { SpaceMutations } from "../../mutations";
import { SpacesQueries } from "../../queries";
import { CreateMessages } from "./Messages";

export const CreateSpaceForm = () => {
    const navigate = useNavigate();
    const createMutation = SpaceMutations.create();
    const spacesQueryUtils = SpacesQueries.useByOrganizationUtils();

    const form = useForm<SpaceDataSchemaType>({
        resolver: zodResolver(SpaceDataSchema),
        defaultValues: { name: "", mapId: "" },
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
    const name = useWatch({ control: form.control, name: "name" });

    return (
        <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="mx-auto flex w-full max-w-xl flex-1 flex-col justify-center gap-8"
        >
            <div className="flex flex-col gap-1">
                <TextFormField
                    control={form.control}
                    name="name"
                    label="Nome"
                    required
                    placeholder="Nome do espaço"
                    disabled={isSubmitting}
                    maxLength={MAX_SPACE_NAME_LENGTH}
                />
                <span className="self-end text-xs text-muted-foreground">
                    {name?.length ?? 0}/{MAX_SPACE_NAME_LENGTH}
                </span>
            </div>

            <GenericFormField
                control={form.control}
                name="mapId"
                label="Mapa"
                required
                render={(field) => (
                    <MapSelectionGrid
                        value={field.value ?? null}
                        onChange={field.onChange}
                    />
                )}
            />

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
