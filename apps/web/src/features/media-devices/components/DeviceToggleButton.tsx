import type { ReactNode } from "react";
import { ChevronUpIcon, Loader2Icon } from "lucide-react";
import { ControlButton } from "@/components/ControlButton";
import { DeviceErrorMark } from "@/features/media-devices/components/DeviceErrorMark";
import { useHotkey } from "@/hooks/useHotkey";
import type { Shortcut } from "@/types/shortcut";
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
    activeLabel: string;
    inactiveLabel: string;
    menuLabel: string;
    devices: MediaDeviceOption[];
    devicesLoading: boolean;
    onOpenDeviceMenu: () => void;
    selectedDeviceId: string;
    onSelectDevice: (deviceId: string) => void;
    secondarySection?: DeviceMenuSection;
    shortcut?: Shortcut;
    // Why the device could not be captured, if it could not.
    errorLabel?: string | null;
};

// The off state keeps the regular icon and lays a red diagonal across it,
// instead of swapping to a fully red "off" icon.
function SlashedIcon({ children }: { children: ReactNode }) {
    return (
        <span className="relative inline-flex">
            {children}
            <svg
                viewBox="0 0 16 16"
                aria-hidden
                className="pointer-events-none absolute inset-0 size-full text-red-500"
            >
                <line
                    x1="2"
                    y1="2"
                    x2="14"
                    y2="14"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                />
            </svg>
        </span>
    );
}

function StatusIcon({
    pending,
    pressed,
    activeIcon,
}: {
    pending: boolean;
    pressed: boolean;
    activeIcon: ReactNode;
}) {
    if (pending) return <Loader2Icon className="animate-spin" />;
    if (pressed) return activeIcon;
    return <SlashedIcon>{activeIcon}</SlashedIcon>;
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
    activeLabel,
    inactiveLabel,
    menuLabel,
    devices,
    devicesLoading,
    onOpenDeviceMenu,
    selectedDeviceId,
    onSelectDevice,
    secondarySection,
    shortcut,
    errorLabel = null,
}: DeviceToggleButtonProps) => {
    const label = pressed ? activeLabel : inactiveLabel;
    useHotkey(shortcut?.keys ?? [], onPressedChange, {
        enabled: !!shortcut && !pending,
    });

    return (
        <div className="flex items-center rounded-xl bg-foreground/10">
            <Tooltip>
                <TooltipTrigger
                    render={
                        <ControlButton
                            type="button"
                            className="relative w-9 rounded-r-none bg-transparent"
                            aria-pressed={pressed}
                            aria-label={label}
                            disabled={pending}
                            onClick={onPressedChange}
                        />
                    }
                >
                    <StatusIcon
                        pending={pending}
                        pressed={pressed}
                        activeIcon={activeIcon}
                    />
                    <DeviceErrorMark errorLabel={errorLabel} />
                </TooltipTrigger>
                <TooltipContent shortcut={shortcut?.label}>
                    {label}
                </TooltipContent>
            </Tooltip>

            <span aria-hidden className="h-6 w-px bg-border -mx-0.5" />

            <DropdownMenu
                onOpenChange={(open) => {
                    if (open) onOpenDeviceMenu();
                }}
            >
                <DropdownMenuTrigger
                    render={
                        <ControlButton
                            className="w-5 rounded-l-none bg-transparent text-muted-foreground [&_svg:not([class*='size-'])]:size-3"
                            aria-label="Selecionar dispositivo"
                        />
                    }
                >
                    <ChevronUpIcon />
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
                                selectedDeviceId={
                                    secondarySection.selectedDeviceId
                                }
                                onSelectDevice={secondarySection.onSelectDevice}
                            />
                        </>
                    )}
                </DropdownMenuContent>
            </DropdownMenu>
        </div>
    );
};
