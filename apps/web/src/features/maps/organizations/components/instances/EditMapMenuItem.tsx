import { Link } from "@tanstack/react-router";
import { PencilIcon } from "lucide-react";
import { DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { useMapRender } from "@/features/game/queries/useMapRender";
import { EDIT_MAP_ACTION } from "../../consts/edit-map-action";
import { useSpaceMapLock } from "../../hooks/useSpaceMapLock";
import { resolveEditMapAction } from "../../utils/resolveEditMapAction";

type Props = { spaceId: string; mapId: string };

// The Edit item of the space menu. It follows the map lock live, so it
// disables itself while someone else edits.
export function EditMapMenuItem({ spaceId, mapId }: Props) {
    const { user } = useAuth();
    const { data } = useMapRender(mapId);
    const lock = useSpaceMapLock(mapId);

    const action = resolveEditMapAction({
        canEdit: data?.access.canEdit ?? false,
        lock,
        userId: user.id,
    });

    switch (action) {
        case EDIT_MAP_ACTION.HIDDEN:
            return null;
        case EDIT_MAP_ACTION.LOCKED_BY_OTHER:
            return (
                <DropdownMenuItem disabled>
                    <PencilIcon />
                    Em edição por {lock.by?.name ?? "outra pessoa"}
                </DropdownMenuItem>
            );
        case EDIT_MAP_ACTION.ENABLED:
            return (
                <DropdownMenuItem
                    render={
                        <Link to="/spaces/$spaceId/edit" params={{ spaceId }} />
                    }
                >
                    <PencilIcon />
                    Editar
                </DropdownMenuItem>
            );
    }
}
