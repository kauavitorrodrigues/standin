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
import { usePublicGlobalSettings } from "@/features/global-settings/queries/usePublicGlobalSettings";
import { useOAuthErrorToast } from "@/features/auth/hooks/useOAuthErrorToast";

type AuthMode = "sign-up" | "sign-in";

export function AuthPage() {
    const { data: settings } = usePublicGlobalSettings();
    const [mode, setMode] = useState<AuthMode>("sign-up");
    // Closed sign up leaves only the login: there is nothing to fill in.
    const isSignUpClosed = settings?.allowSignup === false;
    const isSignUp = mode === "sign-up" && !isSignUpClosed;

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
                    {isSignUpClosed && (
                        <p className="text-sm text-muted-foreground">
                            O cadastro está fechado nesta instalação. Para criar
                            uma conta, peça um link de convite a quem
                            administra.
                        </p>
                    )}
                </CardHeader>
                <CardContent className="flex flex-col gap-4">
                    {isSignUp ? <SignUpForm /> : <SignInForm />}
                    <GithubSignInButton />
                    {!isSignUpClosed && (
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
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
