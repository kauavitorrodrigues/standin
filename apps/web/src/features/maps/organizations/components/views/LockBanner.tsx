type Props = { locked: boolean; by?: { id: string; name: string } };

export function LockBanner({ locked, by }: Props) {
    if (!locked) return null;

    return (
        <div
            role="status"
            className="bg-muted text-muted-foreground pointer-events-none absolute top-3 left-1/2 z-30 -translate-x-1/2 rounded-full border px-3 py-1 text-xs shadow-sm"
        >
            Mapa em edição por {by?.name ?? "outra pessoa"}
        </div>
    );
}
