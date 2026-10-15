import { useForm } from "react-hook-form";
import { Link } from "@tanstack/react-router";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeftIcon, ArrowRightIcon } from "lucide-react";
import { FormProvider } from "react-hook-form";
import { PageContainer } from "@/components/layout/page-container";
import { Button } from "@/components/ui/button";
import type { AreaComposerFormValues } from "../../types/areaComposerForm";
import { AreaComposerSchema } from "../../utils/areaComposerSchema";
import { AreaNameField } from "../forms/AreaNameField";
import { AreaZoneBox } from "../forms/AreaZoneBox";
import { AreaCreateIllustration } from "../views/AreaCreateIllustration";
import { useLibraryScope } from "@/features/library/hooks/useLibraryScope";

type Props = {
    onContinue: (values: AreaComposerFormValues) => void;
};

// The first step of a new area: its name and the zone it creates. Then the
// composer takes the whole screen to draw it.
export const AreaCreateStep = ({ onContinue }: Props) => {
    const { paths } = useLibraryScope();
    const form = useForm<AreaComposerFormValues>({
        resolver: zodResolver(AreaComposerSchema),
        defaultValues: { name: "", createZone: true },
    });

    return (
        <PageContainer.Root className="gap-0">
            <PageContainer.Header
                title="Nova área"
                description="Um bloco pronto de mapa, como uma sala ou uma mesa, que os editores colocam inteiro."
                controls={
                    <Button
                        variant="outline"
                        render={<Link to={paths.areas} />}
                    >
                        <ArrowLeftIcon />
                        Voltar
                    </Button>
                }
            />
            <PageContainer.Content>
                <FormProvider {...form}>
                    <form
                        onSubmit={form.handleSubmit(onContinue)}
                        className="mx-auto flex w-full max-w-xl flex-col items-center gap-8 py-8"
                    >
                        <div className="flex flex-col items-center gap-3 text-center">
                            <AreaCreateIllustration />
                            <h2 className="text-xl font-semibold">
                                Comece pelo nome
                            </h2>
                            <p className="text-muted-foreground max-w-md text-sm">
                                Dê um nome à área e escolha se ela vira uma
                                zona. Depois você monta o conteúdo no editor.
                            </p>
                        </div>

                        <div className="flex w-full flex-col gap-4">
                            <AreaNameField />
                            <AreaZoneBox />
                        </div>

                        <div className="flex w-full justify-end gap-2">
                            <Button
                                type="button"
                                variant="outline"
                                render={<Link to={paths.areas} />}
                            >
                                Cancelar
                            </Button>
                            <Button type="submit">
                                Continuar
                                <ArrowRightIcon />
                            </Button>
                        </div>
                    </form>
                </FormProvider>
            </PageContainer.Content>
        </PageContainer.Root>
    );
};
