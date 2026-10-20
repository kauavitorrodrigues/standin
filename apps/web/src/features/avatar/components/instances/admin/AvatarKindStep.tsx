import { useNavigate, useRouter } from "@tanstack/react-router";
import {
    ArrowLeftIcon,
    PersonStandingIcon,
    ShirtIcon,
    UserIcon,
} from "lucide-react";
import { PageContainer } from "@/components/layout/page-container";
import { Button } from "@/components/ui/button";
import { LibraryEmptyState } from "@/features/library/components/views/LibraryEmptyState";
import {
    AVATAR_ADMIN_PATHS,
    AVATAR_NEW_KINDS,
} from "../../../consts/avatarNew";
import type { AvatarNewKind } from "../../../consts/avatarNew";
import { KindOptionCard } from "../../views/admin/KindOptionCard";

// The first thing a new registration asks: what it is, since each type has its
// own files and its own form.
export const AvatarKindStep = () => {
    const navigate = useNavigate();
    const router = useRouter();

    const choose = (kind: AvatarNewKind) =>
        navigate({ to: AVATAR_ADMIN_PATHS.NEW, search: { kind } });

    return (
        <PageContainer.Root>
            <PageContainer.Header
                title="Novo cadastro"
                description="Peças, avatares base e manequins do editor de avatar."
                controls={
                    <Button
                        variant="outline"
                        onClick={() => router.history.back()}
                    >
                        <ArrowLeftIcon />
                        Voltar
                    </Button>
                }
            />
            <PageContainer.Content className="flex flex-col gap-6 p-4">
                <LibraryEmptyState
                    icon={ShirtIcon}
                    title="O que você quer cadastrar?"
                    message="Escolha uma opção. Cada tipo tem os próprios arquivos e o próprio formulário."
                    actionClassName="max-w-5xl"
                    action={
                        <div className="grid w-full gap-3 sm:grid-cols-3">
                            <KindOptionCard
                                icon={ShirtIcon}
                                title="Peça"
                                description="Roupa, cabelo ou acessório, com a primeira cor."
                                onClick={() => choose(AVATAR_NEW_KINDS.PART)}
                            />
                            <KindOptionCard
                                icon={UserIcon}
                                title="Avatar base"
                                description="O corpo em branco de quem ainda não montou um avatar."
                                onClick={() => choose(AVATAR_NEW_KINDS.BASE)}
                            />
                            <KindOptionCard
                                icon={PersonStandingIcon}
                                title="Manequim de prévia"
                                description="O boneco sem roupa que recebe as peças na prévia."
                                onClick={() =>
                                    choose(AVATAR_NEW_KINDS.MANNEQUIN)
                                }
                            />
                        </div>
                    }
                />
            </PageContainer.Content>
        </PageContainer.Root>
    );
};
