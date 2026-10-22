import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { LinkIcon, Trash2Icon } from "lucide-react";
import type { SpaceInviteLink } from "@standin/contracts";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/toast";
import { GuestMessages } from "../../consts/messages";
import { GuestMutations } from "../../mutations";
import { GuestQueries } from "../../queries";
import { copyInviteLink } from "../../utils/copyInviteLink";

const formatLinkDate = (isoDate: string): string =>
    format(new Date(isoDate), "d MMM, HH:mm", { locale: ptBR });

type LinkRowProps = {
    link: SpaceInviteLink;
    onRevoke: (linkId: string) => void;
};

// A link is listed without its secret: it was shown once, when it was made.
const LinkRow = ({ link, onRevoke }: LinkRowProps) => (
    <li className="flex items-center justify-between gap-2 rounded-lg bg-muted/50 px-3 py-2 text-xs">
        <span className="truncate text-muted-foreground">
            Criado em {formatLinkDate(link.createdAt)} · vale até{" "}
            {formatLinkDate(link.expiresAt)} · {link.usesCount} usos
        </span>
        <Button
            variant="ghost"
            size="icon-sm"
            aria-label="Encerrar link"
            onClick={() => onRevoke(link.id)}
        >
            <Trash2Icon />
        </Button>
    </li>
);

// The links of the space. A fresh one lasts a week and has no use limit and is
// copied as it is made; the owner can close any of them, and who already got in
// stays in.
export const GuestLinks = ({ spaceId }: { spaceId: string }) => {
    const { links } = GuestQueries.useInviteLinks(spaceId, true);
    const create = GuestMutations.createLink(spaceId);
    const revoke = GuestMutations.revokeLink(spaceId);

    const copy = async (token: string) => {
        try {
            await copyInviteLink(token);
        } catch {
            toast.add({ title: GuestMessages.copyFailed, type: "error" });
        }
    };

    const createAndCopy = () =>
        create.mutate(
            {},
            {
                onSuccess: (link) => void copy(link.token),
                onError: () =>
                    toast.add({
                        title: GuestMessages.createLinkFailed,
                        type: "error",
                    }),
            }
        );

    return (
        <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between gap-3">
                <div>
                    <p className="text-sm font-medium">Link de convidado</p>
                    <p className="text-xs text-muted-foreground">
                        Quem abrir o link pede para entrar e um anfitrião
                        precisa admitir. O link é copiado ao ser criado.
                    </p>
                </div>
                <Button
                    size="sm"
                    icon={LinkIcon}
                    isLoading={create.isPending}
                    onClick={createAndCopy}
                >
                    Copiar novo link
                </Button>
            </div>
            <ul className="flex flex-col gap-1">
                {links.map((link) => (
                    <LinkRow
                        key={link.id}
                        link={link}
                        onRevoke={(linkId) => revoke.mutate(linkId)}
                    />
                ))}
            </ul>
        </div>
    );
};
