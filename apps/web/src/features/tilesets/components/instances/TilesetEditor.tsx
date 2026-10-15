import { pruneTileMeta, type LibraryTilesetDetail } from "@standin/contracts";
import { PageContainer } from "@/components/layout/page-container";
import { resolveFileUrl } from "@/lib/api/assetUrl";
import { API_BASE_URL } from "@/lib/api/url";
import { FormIssues } from "@/features/assets/components/views/form/FormIssues";
import { useTilesetEditor } from "../../hooks/useEditor";
import { useTilesetGridForm } from "../../hooks/useGridForm";
import { toTileSheetGrid } from "../../utils/grid/toSheetGrid";
import { TilesetEditorDialogs } from "../dialogs/EditorDialogs";
import { UnsavedChangesDialog } from "../dialogs/UnsavedChangesDialog";
import { TilesetGridForm } from "../forms/GridForm";
import { TilesetEditorControls } from "../views/detail/Controls";
import { TileSheetWorkspace } from "./editor/Workspace";

type Props = { tileset: LibraryTilesetDetail };

// A tileset that exists: its sheet to mark the categories of the tiles and
// divide it into cells, saved together, and the actions on it (rename,
// delete).
export const TilesetEditor = ({ tileset }: Props) => {
    const gridForm = useTilesetGridForm(tileset);
    const editor = useTilesetEditor(tileset, gridForm);
    // The sheet shows the grid being typed, with only the marks that fit in it,
    // and nothing is marked until the grid is applied or discarded.
    const grid = gridForm.draftGrid ?? toTileSheetGrid(tileset);
    const meta = gridForm.changed
        ? pruneTileMeta(editor.meta, grid.tileCount)
        : editor.meta;

    return (
        <PageContainer.Root className="gap-0">
            <PageContainer.Header
                title={tileset.name}
                description="Marque a categoria de cada tile da folha. É o que diz ao mapa o que é chão, parede, teto, decoração e vazio."
                controls={
                    <TilesetEditorControls
                        dirty={editor.dirty}
                        canSave={
                            !gridForm.changed || gridForm.draftGrid !== null
                        }
                        isSaving={editor.isSaving}
                        onRename={() => editor.setDialog("rename")}
                        onDelete={() => editor.setDialog("delete")}
                        onDiscard={editor.discard}
                        onSave={editor.save}
                    />
                }
            />
            <PageContainer.Content className="lg:overflow-hidden">
                <FormIssues message={editor.issuesMessage} />
                <TileSheetWorkspace
                    url={resolveFileUrl(tileset.url, API_BASE_URL)}
                    grid={grid}
                    meta={meta}
                    onChange={editor.setMeta}
                    savedMeta={tileset.tileMeta}
                    imageInUse={tileset.inUse}
                    disabled={editor.isSaving}
                >
                    <TilesetGridForm
                        tileset={tileset}
                        grid={grid}
                        form={gridForm.form}
                        draftGrid={gridForm.draftGrid}
                        changed={gridForm.changed}
                        taggedCount={Object.keys(meta).length}
                        isSaving={gridForm.isSaving}
                    />
                </TileSheetWorkspace>
            </PageContainer.Content>
            <TilesetEditorDialogs
                tileset={tileset}
                dialog={editor.dialog}
                onOpenChange={editor.changeDialogOpen}
                onDeleted={editor.handleDeleted}
            />
            <UnsavedChangesDialog
                open={editor.guard.blocked}
                onStay={editor.guard.stay}
                onLeave={editor.guard.leave}
            />
        </PageContainer.Root>
    );
};
