import { Link } from "@tanstack/react-router";
import { ArrowLeftIcon } from "lucide-react";
import { PageContainer } from "@/components/layout/page-container";
import { Button } from "@/components/ui/button";
import { CreateForm } from "@/features/assets/components/forms/CreateForm";

export function CreateAssetPage() {
    return (
        <PageContainer.Root>
            <PageContainer.Header
                title="Novo asset"
                description="Escolha a imagem, informe o recorte da peça e como ela se comporta no mapa."
                controls={
                    <Button
                        variant="outline"
                        render={<Link to="/admin/assets" />}
                    >
                        <ArrowLeftIcon />
                        Voltar
                    </Button>
                }
            />
            <PageContainer.Content>
                <CreateForm />
            </PageContainer.Content>
        </PageContainer.Root>
    );
}
