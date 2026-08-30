import { useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "@tanstack/react-router";
import { toast } from "@/components/ui/toast";
import { Button } from "@/components/ui/button";
import { zodResolver } from "@hookform/resolvers/zod";
import {
    MAX_MAP_NAME_LENGTH,
    MapDataSchema,
    type MapDataSchemaType,
} from "@standin/contracts";
import { TextFormField } from "@/components/fields/TextFormField";
import { PresetNumberFormField } from "@/components/fields/PresetNumberFormField";
import { MapJsonFileField } from "../fields/MapJsonFileField";
import { TilesetImagesField } from "../fields/TilesetImagesField";
import { MAP_SIZE_PRESETS, TILE_SIZE_PRESETS } from "../../consts/sizePresets";
import { MapMutations } from "../../mutations";
import { MapsQueries } from "../../queries";
import { CreateMessages } from "./Messages";

export const CreateMapForm = () => {
    const navigate = useNavigate();
    const createMutation = MapMutations.create();
    const mapsQueryUtils = MapsQueries.useByOrganizationUtils();

    const [mapJsonFile, setMapJsonFile] = useState<File[]>([]);
    const [tilesetImages, setTilesetImages] = useState<File[]>([]);
    const [mapJsonFileError, setMapJsonFileError] = useState<string>();
    const [tilesetImagesError, setTilesetImagesError] = useState<string>();

    const form = useForm<MapDataSchemaType>({
        resolver: zodResolver(MapDataSchema),
        defaultValues: { name: "" },
    });

    const onSubmit = async (data: MapDataSchemaType) => {
        const hasMapJsonFile = mapJsonFile.length === 1;
        const hasTilesetImages = tilesetImages.length > 0;

        setMapJsonFileError(
            hasMapJsonFile ? undefined : CreateMessages.missingMapJsonFile,
        );
        setTilesetImagesError(
            hasTilesetImages
                ? undefined
                : CreateMessages.missingTilesetImages,
        );
        if (!hasMapJsonFile || !hasTilesetImages) return;

        try {
            await createMutation.mutateAsync({
                data,
                mapJsonFile: mapJsonFile[0],
                tilesetImages,
            });
            toast.add({ title: CreateMessages.success, type: "success" });
            mapsQueryUtils.invalidate();
            navigate({ to: "/maps" });
        } catch {
            toast.add({ title: CreateMessages.error, type: "error" });
        }
    };

    const { isSubmitting } = form.formState;

    return (
        <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="flex max-w-md flex-col gap-4"
        >
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
            <MapJsonFileField
                value={mapJsonFile}
                onValueChange={setMapJsonFile}
                disabled={isSubmitting}
                error={mapJsonFileError}
            />
            <TilesetImagesField
                value={tilesetImages}
                onValueChange={setTilesetImages}
                disabled={isSubmitting}
                error={tilesetImagesError}
            />
            <div className="flex justify-end gap-2">
                <Button
                    type="button"
                    variant="outline"
                    disabled={isSubmitting}
                    onClick={() => navigate({ to: "/maps" })}
                >
                    Cancelar
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                    Criar mapa
                </Button>
            </div>
        </form>
    );
};
