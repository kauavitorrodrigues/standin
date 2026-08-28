import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate } from "@tanstack/react-router";
import {
    MAX_PASSWORD_LENGTH,
    MAX_USER_EMAIL_LENGTH,
    MAX_USER_NAME_LENGTH,
    UserDataSchema,
    type UserDataSchemaType,
} from "@standin/contracts";
import { TextFormField } from "@/components/fields/TextFormField";
import { Button } from "@/components/ui/button";
import { useSignUp } from "../../mutations/signUp";

export function SignUpForm() {
    const navigate = useNavigate();
    const signUpMutation = useSignUp();

    const form = useForm<UserDataSchemaType>({
        resolver: zodResolver(UserDataSchema),
        defaultValues: { name: "", email: "", password: "" },
    });

    const onSubmit = async (data: UserDataSchemaType) => {
        await signUpMutation.mutateAsync(data, {
            onSuccess: () => navigate({ to: "/home" }),
        });
    };

    const isPending = signUpMutation.isPending;

    return (
        <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="flex w-full flex-col gap-4"
        >
            <TextFormField
                control={form.control}
                name="name"
                label="Nome"
                required
                placeholder="Seu nome"
                disabled={isPending}
                maxLength={MAX_USER_NAME_LENGTH}
            />
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
            {signUpMutation.isError && (
                <p className="text-sm text-destructive">
                    Não foi possível criar sua conta. Tente novamente.
                </p>
            )}
            <Button type="submit" size="lg" disabled={isPending}>
                Criar conta
            </Button>
        </form>
    );
}
