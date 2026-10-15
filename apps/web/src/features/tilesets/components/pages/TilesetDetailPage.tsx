import { Link } from "@tanstack/react-router";
import { ArrowLeftIcon } from "lucide-react";
import { PageContainer } from "@/components/layout/page-container";
import { Button } from "@/components/ui/button";
import { useLibraryTileset } from "../../queries/useDetails";
import { TilesetEditor } from "../instances/TilesetEditor";
import { TilesetDetailStatus } from "../views/detail/Status";

type Props = { tilesetId: string };

export function TilesetDetailPage({ tilesetId }: Props) {
    const { data: tileset, isLoading, isError } = useLibraryTileset(tilesetId);

    if (tileset) return <TilesetEditor key={tileset.id} tileset={tileset} />;

    return (
        <PageContainer.Root>
            <PageContainer.Header
                title="Tileset"
                controls={
                    <Button
                        variant="outline"
                        render={<Link to="/admin/tilesets" />}
                    >
                        <ArrowLeftIcon />
                        Voltar
                    </Button>
                }
            />
            <PageContainer.Content>
                <TilesetDetailStatus isLoading={isLoading} isError={isError} />
            </PageContainer.Content>
        </PageContainer.Root>
    );
}
