import { useForm, useWatch } from "react-hook-form";
import { useNavigate } from "@tanstack/react-router";
import type { WallPiece } from "@standin/contracts";
import { toast } from "@/components/ui/toast";
import { applyApiErrorWithFallback } from "@/features/assets/utils/applyApiErrorWithFallback";
import { validateUploadFile } from "@/features/assets/utils/validateUploadFile";
import { useLibraryScope } from "@/features/library/hooks/useLibraryScope";
import { TILESET_MESSAGES } from "../consts/messages";
import { WALL_STYLE_MAX_FILES } from "../consts/wallStyle";
import { useCreateTileset } from "../mutations/create";
import type {
    WallFileEntry,
    WallStyleFormValues,
} from "../types/wallStyleForm";
import { buildWallSheet } from "../utils/wallStyle/buildWallSheet";
import { describeWallIssue } from "../utils/wallStyle/describeWallIssue";
import { encodeSheet, readPixels } from "../utils/wallStyle/image";
import {
    addWallEntries,
    assignFreePieces,
    countPlacedPieces,
    isStripCandidate,
} from "../utils/wallStyle/placeEntries";
import { moveWallPiece } from "../utils/wallStyle/moveWallPiece";
import { setWallPieceFile } from "../utils/wallStyle/setWallPieceFile";
import { isWallStrip, splitWallStrip } from "../utils/wallStyle/splitWallStrip";

const DEFAULT_VALUES: WallStyleFormValues = {
    name: "",
    files: [],
    entries: [],
};

const isStripFile = async (file: File): Promise<boolean> => {
    try {
        return isWallStrip(await readPixels(file));
    } catch {
        return false;
    }
};

const readImages = async (entries: readonly WallFileEntry[]) => {
    if (isStripCandidate(entries)) {
        const image = await readPixels(entries[0].file);
        return isWallStrip(image) ? splitWallStrip(image) : null;
    }
    const pairs = await Promise.all(
        entries.map(
            async ({ file, piece }) => [piece, await readPixels(file)] as const
        )
    );
    return Object.fromEntries(pairs);
};

// Everything the form of a wall style does: takes the files, places the ones
// whose name says a piece and leaves the rest to be chosen by hand, builds the
// sheet and the tile meta from them and sends the tileset.
export const useWallStyleForm = () => {
    const { paths } = useLibraryScope();
    const navigate = useNavigate();
    const createTileset = useCreateTileset();
    const form = useForm<WallStyleFormValues>({
        defaultValues: DEFAULT_VALUES,
    });
    const entries = useWatch({ control: form.control, name: "entries" });

    const changeEntries = (next: WallFileEntry[]) => {
        form.setValue("entries", next);
        form.clearErrors("files");
    };

    // A file whose name says a piece goes to it. Any other takes the first free
    // piece, to be moved by hand. A lone file that is the strip is kept as it is.
    const addFiles = async (files: File[]) => {
        form.setValue("files", []);
        const next = addWallEntries(form.getValues("entries"), files);
        if (isStripCandidate(next) && (await isStripFile(next[0].file))) {
            changeEntries(next);
            return;
        }
        changeEntries(assignFreePieces(next));
    };
    const movePiece = (from: WallPiece, to: WallPiece) =>
        changeEntries(moveWallPiece(form.getValues("entries"), from, to));
    const pickPiece = (piece: WallPiece, file: File | null) =>
        changeEntries(setWallPieceFile(form.getValues("entries"), piece, file));
    const removeStrip = () => changeEntries([]);

    const onSubmit = async (values: WallStyleFormValues) => {
        const name = values.name.trim();
        if (name === "") {
            form.setError("name", {
                message: TILESET_MESSAGES.WALL_STYLE_NAME_REQUIRED,
            });
            return;
        }
        if (values.entries.length === 0) {
            form.setError("files", {
                message: TILESET_MESSAGES.WALL_STYLE_FILES_REQUIRED,
            });
            return;
        }
        const unplaced = values.entries.filter(({ piece }) => piece === null);
        if (unplaced.length > 0 && !isStripCandidate(values.entries)) {
            form.setError("files", {
                message: TILESET_MESSAGES.WALL_STYLE_PIECE_REQUIRED(
                    unplaced.map(({ file }) => file.name)
                ),
            });
            return;
        }

        try {
            for (const { file } of values.entries) {
                const message = await validateUploadFile(file);
                if (message) {
                    form.setError("files", { message });
                    return;
                }
            }
            const images = await readImages(values.entries);
            if (!images) {
                form.setError("files", {
                    message: TILESET_MESSAGES.WALL_STYLE_STRIP_SIZE,
                });
                return;
            }
            const built = buildWallSheet({ images, style: name });
            if (!built.ok) {
                form.setError("files", {
                    message: built.issues.map(describeWallIssue).join(" "),
                });
                return;
            }

            await createTileset.mutateAsync({
                image: await encodeSheet(built.sheet, name),
                data: {
                    name,
                    margin: 0,
                    spacing: 0,
                    tileMeta: built.tileMeta,
                },
            });
            toast.add({ title: TILESET_MESSAGES.CREATED, type: "success" });
            navigate({ to: paths.tilesets });
        } catch (error) {
            applyApiErrorWithFallback(
                error,
                form.setError,
                TILESET_MESSAGES.CREATE_FAILED
            );
        }
    };

    const isStrip = isStripCandidate(entries);
    const placed = countPlacedPieces(entries);

    return {
        form,
        entries,
        isStrip,
        placed,
        isComplete: placed === WALL_STYLE_MAX_FILES,
        addFiles,
        pickPiece,
        movePiece,
        removeStrip,
        isSubmitting: form.formState.isSubmitting,
        issuesMessage: form.formState.errors.root?.message,
        submit: form.handleSubmit(onSubmit),
        cancel: () => navigate({ to: paths.tilesets }),
    };
};
