import type { socket } from "../socket";

export type Socket = typeof socket;
export type SocketStatus = "connected" | "disconnected" | "error";
