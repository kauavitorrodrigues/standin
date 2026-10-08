import type { Response } from "express";
import type { IceServersResponse } from "@standin/contracts";
import type { ExtendedRequest } from "@/types/request";
import {
    buildIceServers,
    readIceServersConfig,
} from "../services/buildIceServers";

export const getIceServers = (req: ExtendedRequest, res: Response) => {
    // RequiresAuth already ran on this route, so a missing user here is a
    // wiring mistake, not a client error worth a friendlier message.
    const userId = req.user?.id;
    if (!userId) {
        res.status(401).end();
        return;
    }

    const response: IceServersResponse = {
        iceServers: buildIceServers(
            userId,
            readIceServersConfig(process.env),
            Date.now()
        ),
    };
    // Short-lived credentials: no shared cache or browser cache may keep them.
    res.set("Cache-Control", "no-store");
    res.status(200).json(response);
};
