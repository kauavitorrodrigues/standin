import { PackageOpen } from "lucide-react";
import { ListResponseState } from "@/components/ListResponseState";

export const TilesetsEmptyState = () => (
    <div className="flex w-full flex-1 items-center justify-center p-6">
        <ListResponseState
            variant="empty"
            icon={PackageOpen}
            title="Nenhum tileset"
            message="Ainda não há nenhum tileset. Envie uma folha em grade de 32 px para pintar o chão e as paredes dos mapas."
        />
    </div>
);
