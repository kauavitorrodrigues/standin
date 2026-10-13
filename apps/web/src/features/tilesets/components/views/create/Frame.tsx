import type { ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { ArrowLeftIcon } from "lucide-react";
import { PageContainer } from "@/components/layout/page-container";
import { Button } from "@/components/ui/button";

type Props = { children: ReactNode };

// The page of a new tileset while it is only a form (the upload step, and the
// fields before the sheet reads as a grid). The editor takes the whole area
// instead, so it does not use this.
export const TilesetCreateFrame = ({ children }: Props) => (
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
        <PageContainer.Content>{children}</PageContainer.Content>
    </PageContainer.Root>
);
