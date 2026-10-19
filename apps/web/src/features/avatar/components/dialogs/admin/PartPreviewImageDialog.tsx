import type { AvatarPartRow } from "@standin/contracts";
import { AVATAR_PART_MESSAGES } from "../../../consts/messages";
import { useReplaceAvatarPartPreview } from "../../../mutations/admin/replacePreview";
import { ReplacePreviewDialog } from "./ReplacePreviewDialog";

type Props = {
    part: AvatarPartRow;
    open: boolean;
    onOpenChange: (open: boolean) => void;
};

export const PartPreviewImageDialog = ({ part, open, onOpenChange }: Props) => {
    const replacePreview = useReplaceAvatarPartPreview();

    return (
        <ReplacePreviewDialog
            title="Imagem da lista"
            description={`A imagem que "${part.name}" mostra na lista do editor de avatar. Sem ela, a lista usa o primeiro quadro da peça.`}
            replace={(image) =>
                replacePreview.mutateAsync({ partId: part.id, image })
            }
            failedMessage={AVATAR_PART_MESSAGES.REPLACE_PREVIEW_FAILED}
            open={open}
            onOpenChange={onOpenChange}
        />
    );
};
