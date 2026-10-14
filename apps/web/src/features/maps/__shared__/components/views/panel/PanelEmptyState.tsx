type PanelEmptyStateProps = {
    title: string;
    message: string;
};

export const PanelEmptyState = ({ title, message }: PanelEmptyStateProps) => (
    <div className="flex h-full flex-col items-center justify-center gap-1 p-6 text-center">
        <span className="text-sm font-medium">{title}</span>
        <span className="text-xs text-muted-foreground">{message}</span>
    </div>
);
