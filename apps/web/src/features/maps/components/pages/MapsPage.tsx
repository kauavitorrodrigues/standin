import { Link } from "@tanstack/react-router";
import { PlusIcon } from "lucide-react";
import { PageContainer } from "@/components/layout/page-container";
import { Button } from "@/components/ui/button";
import { MapsList } from "@/features/maps/components/instances/MapsList";

export function MapsPage() {
    return (
        <PageContainer.Root>
            <PageContainer.Header
                title="Meus mapas"
                controls={
                    <PageContainer.Controls>
                        <Button
                            variant="outline"
                            size="lg"
                            render={<Link to="/maps/new" />}
                        >
                            <PlusIcon />
                            Criar mapa
                        </Button>
                    </PageContainer.Controls>
                }
            />
            <PageContainer.Content>
                <MapsList />
            </PageContainer.Content>
        </PageContainer.Root>
    );
}
