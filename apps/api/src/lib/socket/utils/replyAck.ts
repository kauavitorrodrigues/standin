// A misbehaving client may omit the ack callback, which must not throw.
export const replyAck = <T>(ack: unknown, response: T): void => {
    if (typeof ack !== "function") return;
    ack(response);
};
