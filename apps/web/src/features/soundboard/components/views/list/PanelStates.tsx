export const PanelEmptyState = () => (
    <div className="flex h-full flex-col items-center justify-center gap-1 text-center text-muted-foreground">
        <p className="text-sm">Nenhum clipe por aqui ainda.</p>
        <p className="text-xs">Envie um mp3 pelo botão de adicionar clipe.</p>
    </div>
);

export const PanelNoResultsState = () => (
    <div className="flex h-full items-center justify-center text-center text-sm text-muted-foreground">
        <p>Nenhum clipe com esse nome.</p>
    </div>
);
