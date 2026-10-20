import type { AvatarBase } from "@standin/contracts";
import { AVATAR_BASE_MESSAGES } from "../../../consts/messages";
import { useReplaceAvatarBasePreview } from "../../../mutations/admin/bases/replacePreview";
import { ReplacePreviewDialog } from "./ReplacePreviewDialog";

type Props = {
    base: AvatarBase;
    open: boolean;
    onOpenChange: (open: boolean) => void;
};

export const BasePreviewImageDialog = ({ base, open, onOpenChange }: Props) => {
    const replacePreview = useReplaceAvatarBasePreview();

    return (
        <ReplacePreviewDialog
            title="Imagem da base"
            description={`A imagem que "${base.name}" mostra nas listas. Sem ela, as listas usam o primeiro quadro do sprite.`}
            replace={(image) =>
                replacePreview.mutateAsync({ baseId: base.id, image })
            }
            failedMessage={AVATAR_BASE_MESSAGES.REPLACE_PREVIEW_FAILED}
            open={open}
            onOpenChange={onOpenChange}
        />
    );
};
