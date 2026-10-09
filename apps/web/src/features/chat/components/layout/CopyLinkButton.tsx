import { LinkIcon } from "lucide-react";
import { ClipboardCopyButton } from "@/components/layout/ClipboardCopyDisplay";

type Props = { link: string };

export const CopyLinkButton = ({ link }: Props) => (
    <ClipboardCopyButton
        text={link}
        copyLabel="Copiar link da conversa"
        copiedLabel="Link copiado!"
        variant="ghost"
        icon={LinkIcon}
        className="ml-2 size-7"
    />
);
