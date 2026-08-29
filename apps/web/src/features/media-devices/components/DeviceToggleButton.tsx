import type { ReactNode } from "react";
import { ChevronDownIcon, Loader2Icon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ButtonGroup } from "@/components/ui/button-group";
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuLabel,
    DropdownMenuRadioGroup,
    DropdownMenuRadioItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { MediaDeviceOption } from "@/features/media-devices/hooks/useMediaDeviceControl";
import {
    DeviceMenuEmptyState,
    DeviceMenuLoadingState,
} from "@/features/media-devices/components/ContentStates";

type DeviceMenuSection = {
    label: string;
    devices: MediaDeviceOption[];
    selectedDeviceId: string;
    onSelectDevice: (deviceId: string) => void;
};

type DeviceToggleButtonProps = {
    pressed: boolean;
    pending: boolean;
    onPressedChange: () => void;
    activeIcon: ReactNode;
    inactiveIcon: ReactNode;
    activeLabel: string;
    inactiveLabel: string;
    menuLabel: string;
    devices: MediaDeviceOption[];
    devicesLoading: boolean;
    onOpenDeviceMenu: () => void;
    selectedDeviceId: string;
    onSelectDevice: (deviceId: string) => void;
    secondarySection?: DeviceMenuSection;
};

function getStatusIcon(
    pending: boolean,
    pressed: boolean,
    activeIcon: ReactNode,
    inactiveIcon: ReactNode
): ReactNode {
    if (pending) return <Loader2Icon className="animate-spin" />;
    if (pressed) return activeIcon;
    return inactiveIcon;
}

function DeviceMenuBody({
    devicesLoading,
    devices,
    selectedDeviceId,
    onSelectDevice,
}: {
    devicesLoading: boolean;
    devices: MediaDeviceOption[];
    selectedDeviceId: string;
    onSelectDevice: (deviceId: string) => void;
}) {
    if (devicesLoading) return <DeviceMenuLoadingState />;
    if (devices.length === 0) return <DeviceMenuEmptyState />;

    return (
        <DropdownMenuRadioGroup
            value={selectedDeviceId}
            onValueChange={onSelectDevice}
        >
            {devices.map((device) => (
                <DropdownMenuRadioItem
                    key={device.deviceId}
                    value={device.deviceId}
                >
                    <span
                        className="min-w-0 capitalize truncate"
                        title={device.label}
                    >
                        {device.label}
                    </span>
                </DropdownMenuRadioItem>
            ))}
        </DropdownMenuRadioGroup>
    );
}

export const DeviceToggleButton = ({
    pressed,
    pending,
    onPressedChange,
    activeIcon,
    inactiveIcon,
    activeLabel,
    inactiveLabel,
    menuLabel,
    devices,
    devicesLoading,
    onOpenDeviceMenu,
    selectedDeviceId,
    onSelectDevice,
    secondarySection,
}: DeviceToggleButtonProps) => {
    const label = pressed ? activeLabel : inactiveLabel;
    const icon = getStatusIcon(pending, pressed, activeIcon, inactiveIcon);
    const variant = pressed ? "outline" : "destructive";

    return (
        <ButtonGroup>
            <Tooltip>
                <TooltipTrigger
                    render={
                        <Button
                            type="button"
                            variant={variant}
                            size="icon-lg"
                            aria-pressed={pressed}
                            aria-label={label}
                            disabled={pending}
                            onClick={onPressedChange}
                        />
                    }
                >
                    {icon}
                </TooltipTrigger>
                <TooltipContent>{label}</TooltipContent>
            </Tooltip>

            <DropdownMenu
                onOpenChange={(open) => {
                    if (open) onOpenDeviceMenu();
                }}
            >
                <DropdownMenuTrigger
                    render={
                        <Button
                            variant="outline"
                            size="icon-lg"
                            aria-label="Selecionar dispositivo"
                        />
                    }
                >
                    <ChevronDownIcon />
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-64">
                    <DropdownMenuGroup>
                        <DropdownMenuLabel>{menuLabel}</DropdownMenuLabel>
                    </DropdownMenuGroup>
                    <DeviceMenuBody
                        devicesLoading={devicesLoading}
                        devices={devices}
                        selectedDeviceId={selectedDeviceId}
                        onSelectDevice={onSelectDevice}
                    />

                    {secondarySection && (
                        <>
                            <DropdownMenuSeparator />
                            <DropdownMenuGroup>
                                <DropdownMenuLabel>
                                    {secondarySection.label}
                                </DropdownMenuLabel>
                            </DropdownMenuGroup>
                            <DeviceMenuBody
                                devicesLoading={devicesLoading}
                                devices={secondarySection.devices}
                                selectedDeviceId={secondarySection.selectedDeviceId}
                                onSelectDevice={secondarySection.onSelectDevice}
                            />
                        </>
                    )}
                </DropdownMenuContent>
            </DropdownMenu>
        </ButtonGroup>
    );
};
