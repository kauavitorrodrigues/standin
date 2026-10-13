import { PageContainer } from "@/components/layout/page-container";
import { CreateTilesetButton } from "../layout/CreateButton";
import { TilesetsList } from "../instances/TilesetsList";

export function TilesetsPage() {
    return (
        <PageContainer.Root className="gap-0">
            <PageContainer.Header
                title="Tilesets"
                description="Folhas em grade de 32 px usadas para pintar o chão, as paredes e o teto."
                controls={<CreateTilesetButton />}
            />
            <PageContainer.Content className="p-0">
                <TilesetsList />
            </PageContainer.Content>
        </PageContainer.Root>
    );
}
