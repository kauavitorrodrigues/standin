type Props = { children: string };

// The key that does something, small, next to what it does.
export const ShortcutKey = ({ children }: Props) => (
    <kbd className="text-muted-foreground bg-muted rounded px-1 font-sans text-[0.65rem]">
        {children}
    </kbd>
);
