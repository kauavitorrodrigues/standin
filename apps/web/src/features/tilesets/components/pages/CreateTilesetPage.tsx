import { Link } from "@tanstack/react-router";
import { ArrowLeftIcon } from "lucide-react";
import { PageContainer } from "@/components/layout/page-container";
import { Button } from "@/components/ui/button";
import { CreateTilesetForm } from "../forms/CreateForm";

export function CreateTilesetPage() {
    return (
        <PageContainer.Root className="gap-0">
            <PageContainer.Header
                title="Novo tileset"
                description="Envie a folha em grade de 32 px e marque, sobre ela, o que cada tile é. É com ela que os mapas pintam o chão, as paredes e o teto."
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
            <PageContainer.Content className="lg:overflow-hidden">
                <CreateTilesetForm />
            </PageContainer.Content>
        </PageContainer.Root>
    );
}
