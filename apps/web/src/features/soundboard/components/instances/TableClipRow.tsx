import type { SoundboardClip } from "@standin/contracts";
import { useClipDialogs } from "../../hooks/useClipDialogs";
import { useClipTile } from "../../hooks/useClipTile";
import { buildTableTemplate } from "../../utils/buildTableTemplate";
import { getTableColumns } from "../../utils/getTableColumns";
import { ClipManageMenu } from "../views/tile/ManageMenu";
import { ClipPreviewButton } from "../views/tile/PreviewButton";
import { DataCells } from "../views/table/DataCells";
import { RowButtons } from "../views/table/RowButtons";
import { TableRowFrame } from "../views/table/TableRowFrame";
import { ClipDialogs } from "./ClipDialogs";

type Props = { clip: SoundboardClip; widthPx: number };

// One clip as a row of the table: its data, and at the right the preview, a
// switch that a second click turns off, and the actions menu, which is there
// only for the clips the person may change.
// The row has a primary accent while its clip is being listened to, and the
// preview icon stays white.
export const TableClipRow = ({ clip, widthPx }: Props) => {
    const tile = useClipTile(clip);
    const dialogs = useClipDialogs();
    const columns = getTableColumns(widthPx);

    return (
        <TableRowFrame
            template={buildTableTemplate(columns)}
            isActive={tile.isPlaying}
        >
            <DataCells clip={clip} columns={columns} />
            <RowButtons>
                <ClipPreviewButton clip={clip} onPreview={tile.togglePreview} />
                <ClipManageMenu
                    visible={clip.canManage}
                    onEdit={() => dialogs.open("edit")}
                    onDelete={() => dialogs.open("delete")}
                />
            </RowButtons>
            <ClipDialogs
                clip={clip}
                kind={dialogs.kind}
                onClose={dialogs.close}
            />
        </TableRowFrame>
    );
};
