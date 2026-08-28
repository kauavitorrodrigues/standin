import { useAuth } from "@/features/auth/hooks/useAuth";

export function HomePage() {
    const { user } = useAuth();

    return (
        <div className="flex min-h-dvh w-full flex-col items-center justify-center gap-4 bg-background p-6">
            <h1 className="text-xl font-semibold">Bem-vindo, {user?.name}</h1>
            <pre className="w-full max-w-md overflow-x-auto rounded-lg border border-border bg-muted p-4 text-sm">
                {JSON.stringify(user, null, 2)}
            </pre>
        </div>
    );
}
