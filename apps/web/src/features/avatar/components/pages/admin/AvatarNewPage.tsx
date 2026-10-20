import { AVATAR_BASE_KINDS } from "@standin/contracts";
import { AVATAR_NEW_KINDS } from "../../../consts/avatarNew";
import type { AvatarNewKind } from "../../../consts/avatarNew";
import { NewBaseForm } from "../../forms/admin/NewBaseForm";
import { NewPartForm } from "../../forms/admin/NewPartForm";
import { AvatarKindStep } from "../../instances/admin/AvatarKindStep";
import { NewColorContent } from "../../instances/admin/NewColorContent";
import { AvatarNewFrame } from "../../layout/admin/AvatarNewFrame";

type Props = {
    kind: AvatarNewKind | undefined;
    // The part that gets the color, for a new color.
    partId: string | undefined;
};

// One page for every registration of the avatar admin. It starts by asking
// what to create, and the type lives in the URL so a refresh keeps the form.
export function AvatarNewPage({ kind, partId }: Props) {
    switch (kind) {
        case AVATAR_NEW_KINDS.PART:
            return (
                <AvatarNewFrame
                    title="Nova peça"
                    description="Escolha a categoria e envie o PNG da frente. A cor e o nome saem do arquivo, e o avatar ao lado mostra como a peça fica."
                >
                    <NewPartForm />
                </AvatarNewFrame>
            );
        case AVATAR_NEW_KINDS.COLOR:
            return (
                <AvatarNewFrame
                    title="Nova cor"
                    description="Envie os PNGs da peça já na nova cor. Cada cor tem as próprias imagens, e o editor de avatar mostra só as cores cadastradas."
                >
                    <NewColorContent partId={partId} />
                </AvatarNewFrame>
            );
        case AVATAR_NEW_KINDS.BASE:
            return (
                <AvatarNewFrame
                    title="Novo avatar base"
                    description="O corpo em branco, o que as pessoas usam enquanto não montam um avatar e o corpo em que as peças são desenhadas."
                >
                    <NewBaseForm kind={AVATAR_BASE_KINDS.BODY} />
                </AvatarNewFrame>
            );
        case AVATAR_NEW_KINDS.MANNEQUIN:
            return (
                <AvatarNewFrame
                    title="Novo manequim de prévia"
                    description="O boneco sem roupa que recebe as peças na prévia do admin. Ninguém o escolhe como avatar."
                >
                    <NewBaseForm kind={AVATAR_BASE_KINDS.MANNEQUIN} />
                </AvatarNewFrame>
            );
        default:
            return <AvatarKindStep />;
    }
}
