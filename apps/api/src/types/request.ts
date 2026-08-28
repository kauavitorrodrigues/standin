import type { User } from "@standin/contracts";
import type { Request } from "express";

export type ExtendedRequest = Request & { user?: User };
