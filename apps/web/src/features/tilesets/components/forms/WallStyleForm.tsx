import { SparklesIcon } from "lucide-react";
import { TextFormField } from "@/components/fields/TextFormField";
import { Button } from "@/components/ui/button";
import { FormIssues } from "@/features/assets/components/views/form/FormIssues";
import { WALL_STYLE_MAX_FILES } from "../../consts/wallStyle";
import { useWallStyleForm } from "../../hooks/useWallStyleForm";
import { TilesetCreateFrame } from "../views/create/Frame";
import { WallStyleFilesField } from "../views/create/wall/FilesField";
import { WallPieceList } from "../views/create/wall/PieceList";
import { WallRoomPreview } from "../views/create/wall/RoomPreview";

const getCreateLabel = (placed: number): string => {
    if (placed >= WALL_STYLE_MAX_FILES) return "Criar estilo";
    const missing = WALL_STYLE_MAX_FILES - placed;
    return missing === 1 ? "Falta 1 peça" : `Faltam ${missing} peças`;
};

// A new wall style. The room on the left is the result: it fills in as the
// pieces are sent, and each place of it takes the file of its piece. The sheet,
// the sides of each piece, the cap and the collision are built from them.
export const WallStyleForm = () => {
    const state = useWallStyleForm();

    return (
        <TilesetCreateFrame
            title="Novo estilo de parede"
            description="Suba as 8 peças e veja a sala se montar. O sistema cuida dos lados, do remate e da colisão."
        >
            <form
                onSubmit={state.submit}
                className="mx-auto grid w-full max-w-5xl flex-1 content-center gap-8 py-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,24rem)]"
            >
                <div className="flex flex-col gap-4">
                    <WallRoomPreview
                        entries={state.entries}
                        disabled={state.isSubmitting}
                        onPick={state.pickPiece}
                    />
                </div>
                <div className="flex min-w-0 flex-col gap-5">
                    <FormIssues message={state.issuesMessage} />
                    <TextFormField
                        control={state.form.control}
                        name="name"
                        label="Nome do estilo"
                        required
                        placeholder="Tijolo, Vidro, Madeira"
                        disabled={state.isSubmitting}
                    />
                    <WallStyleFilesField
                        control={state.form.control}
                        disabled={state.isSubmitting}
                        onFiles={state.addFiles}
                    />
                    <WallPieceList
                        entries={state.entries}
                        disabled={state.isSubmitting}
                        onMove={state.movePiece}
                        onRemove={state.pickPiece}
                        onRemoveStrip={state.removeStrip}
                    />
                    <div className="flex justify-end gap-2">
                        <Button
                            type="button"
                            variant="outline"
                            disabled={state.isSubmitting}
                            onClick={state.cancel}
                        >
                            Cancelar
                        </Button>
                        <Button
                            type="submit"
                            disabled={state.isSubmitting || !state.isComplete}
                        >
                            <SparklesIcon />
                            {getCreateLabel(state.placed)}
                        </Button>
                    </div>
                </div>
            </form>
        </TilesetCreateFrame>
    );
};
