import { Grid2x2Icon } from "lucide-react";
import { LibraryEmptyState } from "@/features/library/components/views/LibraryEmptyState";
import { CreateTilesetButton } from "../../layout/CreateButton";

export const TilesetsEmptyState = () => (
    <LibraryEmptyState
        icon={Grid2x2Icon}
        title="Nenhum tileset cadastrado"
        message="Ainda não há nenhum tileset cadastrado. Envie uma folha em grade de 32 px para pintar o chão e as paredes dos mapas."
        action={<CreateTilesetButton />}
    />
);
