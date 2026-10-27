import type { types } from "mediasoup-client";

/**
 * Turns the encoding of a producer on or off. With every encoding inactive the
 * browser stops encoding the video and sends nothing, while the camera keeps
 * being captured, so starting again is quick. This is what saves the CPU when
 * nobody is near enough to receive the video.
 *
 * Does nothing when the producer has no sender yet or is already in that state.
 */
export const setSenderActive = async (
    producer: Pick<types.Producer, "rtpSender">,
    active: boolean
): Promise<void> => {
    const sender = producer.rtpSender;
    if (!sender) return;

    const parameters = sender.getParameters();
    const encodings = parameters.encodings ?? [];
    if (encodings.every((encoding) => (encoding.active ?? true) === active)) {
        return;
    }

    encodings.forEach((encoding) => {
        encoding.active = active;
    });
    await sender.setParameters(parameters);
};
