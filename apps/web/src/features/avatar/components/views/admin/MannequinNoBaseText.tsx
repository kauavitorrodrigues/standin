import { Link } from "@tanstack/react-router";
import { AVATAR_BASE_KINDS } from "@standin/contracts";
import type { AvatarBaseKind } from "@standin/contracts";
import {
    AVATAR_ADMIN_PATHS,
    AVATAR_NEW_KINDS,
} from "../../../consts/avatarNew";

type Props = {
    // The kind of the figure on the stage, null when there is none.
    kind: AvatarBaseKind | null;
};

// What the note says. A body on the stage means no mannequin is registered, and
// no figure at all means not even a body is. Each link opens the registration
// of what is missing.
export const MannequinNoBaseText = ({ kind }: Props) => {
    switch (kind) {
        case AVATAR_BASE_KINDS.BODY:
            return (
                <>
                    Nenhum manequim cadastrado.{" "}
                    <Link
                        to={AVATAR_ADMIN_PATHS.NEW}
                        search={{ kind: AVATAR_NEW_KINDS.MANNEQUIN }}
                        className="text-foreground underline underline-offset-4"
                    >
                        Cadastre um manequim
                    </Link>{" "}
                    para ver a peça num corpo sem roupa.
                </>
            );
        case AVATAR_BASE_KINDS.MANNEQUIN:
            return null;
        case null:
            return (
                <>
                    Nenhum avatar base cadastrado.{" "}
                    <Link
                        to={AVATAR_ADMIN_PATHS.NEW}
                        search={{ kind: AVATAR_NEW_KINDS.BASE }}
                        className="text-foreground underline underline-offset-4"
                    >
                        Cadastre um avatar base
                    </Link>{" "}
                    para ver a peça no corpo.
                </>
            );
    }
};
