import { ChevronDownIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { MOVEMENT_MESSAGES } from "../../../consts/movementMessages";
import { TeleportWhenBlockedSwitch } from "../../instances/TeleportWhenBlockedSwitch";
import { ThemeSelector } from "../../instances/ThemeSelector";
import { SettingsGroup } from "../../layout/SettingsGroup";
import { SettingsRow } from "../../layout/SettingsRow";

// The language control is not wired yet: the app has no source of truth for
// it.
export const GeneralSection = () => (
    <>
        <SettingsGroup label="Idioma">
            <SettingsRow
                title="Idioma de exibição"
                description="Escolha o idioma usado no Standin"
            >
                <Button variant="outline" size="sm" disabled>
                    Português (BR)
                    <ChevronDownIcon />
                </Button>
            </SettingsRow>
        </SettingsGroup>
        <SettingsGroup label="Aparência">
            <SettingsRow
                title="Modo de cor"
                description="Escolha entre claro, escuro ou o padrão do sistema"
            >
                <ThemeSelector />
            </SettingsRow>
        </SettingsGroup>
        <SettingsGroup label={MOVEMENT_MESSAGES.groupLabel}>
            <SettingsRow
                title={MOVEMENT_MESSAGES.teleportTitle}
                description={MOVEMENT_MESSAGES.teleportDescription}
            >
                <TeleportWhenBlockedSwitch />
            </SettingsRow>
        </SettingsGroup>
    </>
);
