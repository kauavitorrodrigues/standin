import { PageContainer } from "@/components/layout/page-container";
import { GLOBAL_SETTINGS_PAGE_TEXT } from "../../consts/messages";
import { SettingsCard } from "../views/SettingsCard";

export function GlobalSettingsPage() {
    return (
        <PageContainer.Root>
            <PageContainer.Header
                title={GLOBAL_SETTINGS_PAGE_TEXT.TITLE}
                description={GLOBAL_SETTINGS_PAGE_TEXT.DESCRIPTION}
            />
            <PageContainer.Content className="p-6">
                <SettingsCard />
            </PageContainer.Content>
        </PageContainer.Root>
    );
}
