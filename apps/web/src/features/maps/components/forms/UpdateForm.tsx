import { useForm } from "react-hook-form";
import { toast } from "@/components/ui/toast";
import { zodResolver } from "@hookform/resolvers/zod";
import {
    MAX_MAP_NAME_LENGTH,
    MapUpdateSchema,
    type MapEntity,
    type MapUpdateSchemaType,
} from "@standin/contracts";
import { TextFormField } from "@/components/fields/TextFormField";
import { PresetNumberFormField } from "@/components/fields/PresetNumberFormField";
import { FormDialogControls } from "@/components/FormDialogControls";
import { MAP_SIZE_PRESETS, TILE_SIZE_PRESETS } from "../../consts/sizePresets";
import { MapMutations } from "../../mutations";
import { MapsQueries } from "../../queries";
import { UpdateMessages } from "./Messages";

type Props = {
    map: MapEntity;
    onShowDialog: (open: boolean) => void;
};

export const UpdateMapForm = ({ map, onShowDialog }: Props) => {
    const updateMutation = MapMutations.update();
    const mapsQueryUtils = MapsQueries.useByOrganizationUtils();

    const form = useForm<MapUpdateSchemaType>({
        resolver: zodResolver(MapUpdateSchema),
        defaultValues: {
            name: map.name,
            width: map.width,
            height: map.height,
            tileSize: map.tileSize,
        },
    });

    const onSubmit = async (data: MapUpdateSchemaType) => {
        try {
            await updateMutation.mutateAsync({ id: map.id, ...data });
            toast.add({ title: UpdateMessages.success, type: "success" });
            mapsQueryUtils.invalidate();
            onShowDialog(false);
        } catch {
            toast.add({ title: UpdateMessages.error, type: "error" });
        }
    };

    const { isSubmitting } = form.formState;

    return (
        <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-4">
            <TextFormField
                control={form.control}
                name="name"
                label="Nome"
                required
                placeholder="Nome do mapa"
                disabled={isSubmitting}
                maxLength={MAX_MAP_NAME_LENGTH}
            />
            <PresetNumberFormField
                control={form.control}
                name="width"
                label="Largura"
                required
                presets={MAP_SIZE_PRESETS}
                disabled={isSubmitting}
            />
            <PresetNumberFormField
                control={form.control}
                name="height"
                label="Altura"
                required
                presets={MAP_SIZE_PRESETS}
                disabled={isSubmitting}
            />
            <PresetNumberFormField
                control={form.control}
                name="tileSize"
                label="Tamanho do tile"
                required
                presets={TILE_SIZE_PRESETS}
                unit="px"
                disabled={isSubmitting}
            />
            <FormDialogControls
                onClose={() => {
                    form.reset();
                    onShowDialog(false);
                }}
                submitLabel="Salvar"
                isSubmitting={isSubmitting}
            />
        </form>
    );
};
