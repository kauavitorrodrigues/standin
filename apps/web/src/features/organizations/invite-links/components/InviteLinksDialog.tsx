import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { LinkIcon, Trash2Icon } from "lucide-react";
import type { OrganizationInviteLink } from "@standin/contracts";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "@/components/ui/toast";
import {
    useCreateOrganizationInviteLink,
    useRevokeOrganizationInviteLink,
} from "../mutations/useInviteLinkMutations";
import { useOrganizationInviteLinks } from "../queries/useInviteLinks";
import { buildJoinLink } from "../utils/buildJoinLink";

const formatLinkDate = (iso: string): string =>
    format(new Date(iso), "d MMM, HH:mm", { locale: ptBR });

type Props = {
    organizationId: string;
    open: boolean;
    onOpenChange: (open: boolean) => void;
};

// The links of the organization. A new one lasts a week, has no use limit and
// is copied as it is made (the token is shown only then). The owner can close
// any of them; who already signed up stays in.
export const InviteLinksDialog = ({
    organizationId,
    open,
    onOpenChange,
}: Props) => {
    const { links } = useOrganizationInviteLinks(organizationId, open);
    const create = useCreateOrganizationInviteLink(organizationId);
    const revoke = useRevokeOrganizationInviteLink(organizationId);

    const createAndCopy = () =>
        create.mutate(
            {},
            {
                onSuccess: async (link) => {
                    try {
                        await navigator.clipboard.writeText(
                            buildJoinLink(window.location.origin, link.token)
                        );
                        toast.add({ title: "Link copiado.", type: "success" });
                    } catch {
                        toast.add({
                            title: "Não foi possível copiar o link.",
                            type: "error",
                        });
                    }
                },
                onError: () =>
                    toast.add({
                        title: "Não foi possível criar o link.",
                        type: "error",
                    }),
            }
        );

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Convidar pessoas</DialogTitle>
                    <DialogDescription>
                        Quem abrir o link cria uma conta direto nesta
                        organização, mesmo com o cadastro fechado.
                    </DialogDescription>
                </DialogHeader>
                <Button
                    icon={LinkIcon}
                    isLoading={create.isPending}
                    onClick={createAndCopy}
                >
                    Copiar novo link
                </Button>
                <ul className="flex flex-col gap-1">
                    {links.map((link: OrganizationInviteLink) => (
                        <li
                            key={link.id}
                            className="flex items-center justify-between gap-2 rounded-lg bg-muted/50 px-3 py-2 text-xs"
                        >
                            <span className="truncate text-muted-foreground">
                                Criado em {formatLinkDate(link.createdAt)} ·
                                vale até {formatLinkDate(link.expiresAt)} ·{" "}
                                {link.usesCount} usos
                            </span>
                            <Button
                                variant="ghost"
                                size="icon-sm"
                                aria-label="Encerrar link"
                                onClick={() => revoke.mutate(link.id)}
                            >
                                <Trash2Icon />
                            </Button>
                        </li>
                    ))}
                </ul>
            </DialogContent>
        </Dialog>
    );
};
