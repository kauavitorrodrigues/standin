import { useState } from "react";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { SignUpForm } from "@/features/auth/components/forms/SignUpForm";
import { SignInForm } from "@/features/auth/components/forms/SignInForm";
import { GithubSignInButton } from "@/features/auth/components/instances/GithubSignInButton";
import { useOAuthErrorToast } from "@/features/auth/hooks/useOAuthErrorToast";

type AuthMode = "sign-up" | "sign-in";

export function AuthPage() {
    const [mode, setMode] = useState<AuthMode>("sign-up");
    const isSignUp = mode === "sign-up";

    useOAuthErrorToast();

    return (
        <div className="flex min-h-dvh w-full items-center justify-center bg-background p-6">
            <Card className="w-full max-w-sm">
                <CardHeader>
                    <CardTitle>{isSignUp ? "Criar conta" : "Entrar"}</CardTitle>
                    <CardDescription>
                        {isSignUp
                            ? "Preencha os dados abaixo para criar sua conta."
                            : "Entre com seu e-mail e senha."}
                    </CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col gap-4">
                    {isSignUp ? <SignUpForm /> : <SignInForm />}
                    <GithubSignInButton />
                    <Button
                        type="button"
                        variant="ghost"
                        onClick={() =>
                            setMode(isSignUp ? "sign-in" : "sign-up")
                        }
                    >
                        {isSignUp
                            ? "Já tenho uma conta"
                            : "Quero criar uma conta"}
                    </Button>
                </CardContent>
            </Card>
        </div>
    );
}
