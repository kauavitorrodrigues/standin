import type { ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { ArrowLeftIcon } from "lucide-react";
import { PageContainer } from "@/components/layout/page-container";
import { Button } from "@/components/ui/button";
import { AVATAR_ADMIN_PATHS } from "../../../consts/avatarNew";

type Props = {
    title: string;
    description: string;
    children: ReactNode;
};

// The page of a registration once its type is chosen. The button in the
// header goes back to the question of what to create.
export const AvatarNewFrame = ({ title, description, children }: Props) => (
    <PageContainer.Root>
        <PageContainer.Header
            title={title}
            description={description}
            controls={
                <Button
                    variant="outline"
                    render={<Link to={AVATAR_ADMIN_PATHS.NEW} />}
                >
                    <ArrowLeftIcon />
                    Trocar tipo
                </Button>
            }
        />
        <PageContainer.Content className="flex flex-col p-4">
            {children}
        </PageContainer.Content>
    </PageContainer.Root>
);
