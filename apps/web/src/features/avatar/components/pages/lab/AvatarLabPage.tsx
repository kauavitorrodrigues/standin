import { useForm } from "react-hook-form";
import { AVATAR, AVATAR_SHEET_PX, TILE_SIZE } from "@standin/contracts";
import {
    LAB_DEFAULT_ZOOM,
    LAB_SCENE_TILES,
    LAB_ZOOMS,
} from "../../../consts/lab";
import type { LabGuides } from "../../views/lab/LabAvatar";
import { LAB_RULER_THICKNESS_PX, LabRuler } from "../../views/lab/LabRuler";
import { LabScene } from "../../views/lab/LabScene";

type LabForm = {
    zoom: number;
    guides: LabGuides;
};

const DEFAULT_VALUES: LabForm = {
    zoom: LAB_DEFAULT_ZOOM,
    guides: {
        frame: true,
        visible: true,
        body: true,
        anchor: true,
        nameTag: true,
    },
};

// How much room is left on each side of the door for the body to pass.
const DOOR_SIDE_GAP_PX = (TILE_SIZE - AVATAR.body.w) / 2;

// The page of the lab, only in development: it shows the avatar next to the
// pieces of the map, at a whole zoom and with a ruler, so the size can be
// judged by eye before it is fixed. It never goes to the server.
export const AvatarLabPage = () => {
    const { register, watch } = useForm<LabForm>({
        defaultValues: DEFAULT_VALUES,
    });
    const { zoom, guides } = watch();

    return (
        <div className="flex flex-col gap-6 p-6">
            <header className="flex flex-col gap-1">
                <h1 className="text-xl font-semibold">Laboratório do avatar</h1>
                <p className="text-muted-foreground text-sm">
                    Tamanho do avatar ao lado de mesa, cadeira, porta e parede
                    fina, em zoom inteiro. Só aparece em desenvolvimento.
                </p>
            </header>

            <form className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm">
                <label className="flex items-center gap-2">
                    Zoom
                    <select
                        className="border-input bg-background rounded-md border px-2 py-1"
                        {...register("zoom", { valueAsNumber: true })}
                    >
                        {LAB_ZOOMS.map((option) => (
                            <option key={option} value={option}>
                                {option}x
                            </option>
                        ))}
                    </select>
                </label>
                <label className="flex items-center gap-2">
                    <input type="checkbox" {...register("guides.frame")} />
                    Contorno do frame
                </label>
                <label className="flex items-center gap-2">
                    <input type="checkbox" {...register("guides.visible")} />
                    Corpo visível
                </label>
                <label className="flex items-center gap-2">
                    <input type="checkbox" {...register("guides.body")} />
                    Corpo de colisão
                </label>
                <label className="flex items-center gap-2">
                    <input type="checkbox" {...register("guides.anchor")} />
                    Âncora
                </label>
                <label className="flex items-center gap-2">
                    <input type="checkbox" {...register("guides.nameTag")} />
                    Etiqueta de nome
                </label>
            </form>

            <ul className="text-muted-foreground grid gap-1 text-sm sm:grid-cols-2">
                <li>
                    Frame {AVATAR.frame.w} x {AVATAR.frame.h} px, folha{" "}
                    {AVATAR_SHEET_PX.w} x {AVATAR_SHEET_PX.h} px
                </li>
                <li>
                    Âncora em {AVATAR.anchor.x}, {AVATAR.anchor.y} (os pés)
                </li>
                <li>
                    Corpo visível {AVATAR.visible.w} x {AVATAR.visible.h} px
                </li>
                <li>
                    Corpo de colisão {AVATAR.body.w} x {AVATAR.body.h} px, em
                    vão de {TILE_SIZE} px sobram {DOOR_SIDE_GAP_PX} px por lado
                </li>
                <li>
                    Etiqueta a {AVATAR.nameTagGap} px do topo, alcance de
                    interação {AVATAR.interactRadius} px
                </li>
                <li>
                    Cena de {LAB_SCENE_TILES.cols} x {LAB_SCENE_TILES.rows}{" "}
                    tiles de {TILE_SIZE} px
                </li>
            </ul>

            <div className="overflow-auto">
                <div className="flex w-max flex-col">
                    <div className="flex">
                        <div
                            className="shrink-0"
                            style={{ width: LAB_RULER_THICKNESS_PX }}
                            aria-hidden
                        />
                        <LabRuler
                            orientation="horizontal"
                            length={LAB_SCENE_TILES.cols * TILE_SIZE}
                            zoom={zoom}
                        />
                    </div>
                    <div className="flex">
                        <LabRuler
                            orientation="vertical"
                            length={LAB_SCENE_TILES.rows * TILE_SIZE}
                            zoom={zoom}
                        />
                        <LabScene zoom={zoom} guides={guides} />
                    </div>
                </div>
            </div>
        </div>
    );
};
