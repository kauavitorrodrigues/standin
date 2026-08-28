import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate } from "@tanstack/react-router";
import {
    MAX_PASSWORD_LENGTH,
    MAX_USER_EMAIL_LENGTH,
    SignInSchema,
    type SignInSchemaType,
} from "@standin/contracts";
import { TextFormField } from "@/components/fields/TextFormField";
import { Button } from "@/components/ui/button";
import { useSignIn } from "../../mutations/signIn";

export function SignInForm() {
    const navigate = useNavigate();
    const signInMutation = useSignIn();

    const form = useForm<SignInSchemaType>({
        resolver: zodResolver(SignInSchema),
        defaultValues: { email: "", password: "" },
    });

    const onSubmit = async (data: SignInSchemaType) => {
        await signInMutation.mutateAsync(data, {
            onSuccess: () => navigate({ to: "/home" }),
            onError: () => form.resetField("password"),
        });
    };

    const isPending = signInMutation.isPending;

    return (
        <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="flex w-full flex-col gap-4"
        >
            <TextFormField
                control={form.control}
                name="email"
                label="Email"
                required
                type="email"
                placeholder="Seu e-mail"
                disabled={isPending}
                maxLength={MAX_USER_EMAIL_LENGTH}
            />
            <TextFormField
                control={form.control}
                name="password"
                label="Senha"
                required
                type="password"
                placeholder="Sua senha"
                disabled={isPending}
                maxLength={MAX_PASSWORD_LENGTH}
            />
            {signInMutation.isError && (
                <p className="text-sm text-destructive">
                    Email ou senha inválidos.
                </p>
            )}
            <Button type="submit" size="lg" disabled={isPending}>
                Entrar
            </Button>
        </form>
    );
}
