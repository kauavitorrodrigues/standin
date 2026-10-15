import {
    AlertDialogCancel,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import type { PublishIssueRow } from "@/features/editor/types/publish-issue-row";
import { PublishIssueAction } from "@/features/editor/components/views/publish/PublishIssueAction";

type PublishIssuesBodyProps = {
    rows: PublishIssueRow[];
    onFocus: (row: PublishIssueRow) => void;
};

// The server refused some operations. The draft is kept, so the person goes to
// each place, fixes it and publishes again.
export const PublishIssuesBody = ({
    rows,
    onFocus,
}: PublishIssuesBodyProps) => (
    <>
        <AlertDialogHeader>
            <AlertDialogTitle>Não foi possível publicar</AlertDialogTitle>
            <AlertDialogDescription>
                Corrija os pontos abaixo e publique de novo. Seu rascunho foi
                mantido.
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
            <AlertDialogCancel>Fechar</AlertDialogCancel>
        </AlertDialogFooter>
    </>
);
