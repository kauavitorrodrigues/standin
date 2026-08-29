import { useCallback, useEffect, useState } from "react";
import {
    getDeviceEnabledPreference,
    getPreferredDeviceId,
    setDeviceEnabledPreference,
    setPreferredDeviceId,
    type MediaDeviceKind,
} from "@/features/media-devices/lib/mediaDevicePreferences";

export type MediaDeviceOption = { deviceId: string; label: string };

type ToggleableMediaDeviceKind = Extract<MediaDeviceKind, "microphone" | "camera">;

const INPUT_KIND: Record<ToggleableMediaDeviceKind, MediaDeviceInfo["kind"]> = {
    microphone: "audioinput",
    camera: "videoinput",
};

const DEFAULT_LABEL: Record<ToggleableMediaDeviceKind, string> = {
    microphone: "Microfone",
    camera: "Câmera",
};

const AUDIO_OUTPUT_DEFAULT_LABEL = "Saída de áudio";

export function useMediaDeviceControl(kind: ToggleableMediaDeviceKind) {
    const hasAudioOutput = kind === "microphone";

    const [enabled, setEnabled] = useState(() =>
        getDeviceEnabledPreference(kind)
    );

    const [selectedDeviceId, setSelectedDeviceId] = useState(
        () => getPreferredDeviceId(kind) ?? ""
    );

    const [devices, setDevices] = useState<MediaDeviceOption[]>([]);
    const [pending, setPending] = useState(false);
    const [devicesLoading, setDevicesLoading] = useState(false);

    const [outputDevices, setOutputDevices] = useState<MediaDeviceOption[]>([]);
    const [selectedOutputDeviceId, setSelectedOutputDeviceId] = useState(
        () => getPreferredDeviceId("speaker") ?? ""
    );

    const refreshDevices = useCallback(async () => {
        const allDevices = await navigator.mediaDevices.enumerateDevices();
        const options = allDevices
            .filter((device) => device.kind === INPUT_KIND[kind])
            .map((device, index) => ({
                deviceId: device.deviceId,
                label: device.label || `${DEFAULT_LABEL[kind]} ${index + 1}`,
            }));
        setDevices(options);

        if (hasAudioOutput) {
            const outputOptions = allDevices
                .filter((device) => device.kind === "audiooutput")
                .map((device, index) => ({
                    deviceId: device.deviceId,
                    label:
                        device.label ||
                        `${AUDIO_OUTPUT_DEFAULT_LABEL} ${index + 1}`,
                }));
            setOutputDevices(outputOptions);
        }
    }, [hasAudioOutput, kind]);

    useEffect(() => {
        navigator.mediaDevices.enumerateDevices().then((allDevices) => {
            const alreadyGranted = allDevices.some(
                (device) => device.kind === INPUT_KIND[kind] && device.label
            );
            if (alreadyGranted) void refreshDevices();
        });
    }, [kind, refreshDevices]);

    const requestPermission = useCallback(async () => {
        const constraints: MediaStreamConstraints =
            kind === "microphone" ? { audio: true } : { video: true };
        const stream = await navigator.mediaDevices.getUserMedia(constraints);
        stream.getTracks().forEach((track) => track.stop());
        await refreshDevices();
    }, [kind, refreshDevices]);

    const toggle = useCallback(async () => {
        const next = !enabled;
        const isReconnecting = next && devices.length === 0;

        if (isReconnecting) {
            setPending(true);
            try {
                await requestPermission();
            } catch {
                setPending(false);
                return;
            }
            setPending(false);
        }

        setDeviceEnabledPreference(kind, next);
        setEnabled(next);
    }, [enabled, devices.length, kind, requestPermission]);

    const ensureDevicesLoaded = useCallback(async () => {
        if (devices.length > 0 || devicesLoading) return;

        setDevicesLoading(true);
        try {
            await requestPermission();
        } catch {
            // Permission denied or dismissed: the menu just shows an empty state.
        } finally {
            setDevicesLoading(false);
        }
    }, [devices.length, devicesLoading, requestPermission]);

    const selectDevice = useCallback(
        (deviceId: string) => {
            setPreferredDeviceId(kind, deviceId);
            setSelectedDeviceId(deviceId);
        },
        [kind]
    );

    const selectOutputDevice = useCallback((deviceId: string) => {
        setPreferredDeviceId("speaker", deviceId);
        setSelectedOutputDeviceId(deviceId);
    }, []);

    return {
        enabled,
        pending,
        toggle,
        devices,
        devicesLoading,
        ensureDevicesLoaded,
        selectedDeviceId,
        selectDevice,
        outputDevices,
        selectedOutputDeviceId,
        selectOutputDevice,
    };
}
