import {
    AlertDialogCancel,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { PublishIssueAction } from "@/features/editor/components/views/publish/PublishIssueAction";
import type { PublishIssueRow } from "@/features/editor/types/publish-issue-row";

type ValidationBodyProps = {
    rows: PublishIssueRow[];
    onFocus: (row: PublishIssueRow) => void;
    onDiscard: () => void;
};

// The server refused some changes. The decorator stays open with the draft, so
// the person goes to each place and fixes it, or throws everything away.
export const ValidationBody = ({
    rows,
    onFocus,
    onDiscard,
}: ValidationBodyProps) => (
    <>
        <AlertDialogHeader>
            <AlertDialogTitle>Não foi possível aplicar</AlertDialogTitle>
            <AlertDialogDescription>
                Corrija os pontos abaixo e feche o decorator de novo. Sua
                decoração foi mantida.
            </AlertDialogDescription>
        </AlertDialogHeader>
        <ul className="flex max-h-64 flex-col gap-2 overflow-y-auto text-sm">
            {rows.map((row) => (
                <li
                    key={row.key}
                    className="flex items-center justify-between gap-3 rounded-lg bg-destructive/10 px-3 py-2"
                >
                    <span>{row.text}</span>
                    <PublishIssueAction row={row} onFocus={onFocus} />
                </li>
            ))}
        </ul>
        <AlertDialogFooter>
            <Button type="button" variant="destructive" onClick={onDiscard}>
                Descartar alterações
            </Button>
            <AlertDialogCancel>Continuar decorando</AlertDialogCancel>
        </AlertDialogFooter>
    </>
);
